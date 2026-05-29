const { pool } = require("../../../config/database");
const websocketServer = require("../../../shared/services/websocket");
const draftService = require("./draft.service"); // for STATUS constant or duplicated? Let's duplicate basic constants to avoid circular deps if any.
const { notifyAllAdmins } = require("../../notification/services/notification.service");

const STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

const getVersionDetails = async (versionId, regionId) => {
  const [versions] = await pool.query(
    "SELECT * FROM boundary_versions WHERE id = ? AND region_id = ?",
    [versionId, regionId]
  );
  return versions.length > 0 ? versions[0] : null;
};

const isOnlyPublishedVersion = async (regionId) => {
  const [publishedVersions] = await pool.query(
    "SELECT COUNT(*) as count FROM boundary_versions WHERE region_id = ? AND status = ?",
    [regionId, STATUS.PUBLISHED]
  );
  return publishedVersions[0].count <= 1;
};

const deleteVersion = async (versionId) => {
  await pool.query("DELETE FROM boundary_versions WHERE id = ?", [versionId]);
};

const getDeletionCounts = async (regionId) => {
  const [versionCount] = await pool.query(
    "SELECT COUNT(*) as count FROM boundary_versions WHERE region_id = ?",
    [regionId]
  );

  return {
    versions: parseInt(versionCount[0].count),
  };
};

const deleteAllBoundaryData = async (regionId) => {
  // Delete all boundary versions for this region
  await pool.query("DELETE FROM boundary_versions WHERE region_id = ?", [
    regionId,
  ]);
};

const publishDraft = async (regionId, userId) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    // Get user's draft for this region
    const [drafts] = await connection.query(
      "SELECT bv.*, r.name as region_name FROM boundary_versions bv JOIN regions r ON bv.region_id = r.id WHERE bv.region_id = ? AND bv.status = ? AND bv.created_by = ?",
      [regionId, "draft", userId]
    );
    if (drafts.length === 0) throw new Error("Draft not found");
    const draft = drafts[0];

    // Archive current published
    await connection.query(
      "UPDATE boundary_versions SET status = 'archived' WHERE region_id = ? AND status = 'published'",
      [regionId]
    );

    // Update draft to published
    await connection.query(
      "UPDATE boundary_versions SET status = 'published', published_by = ?, published_at = NOW() WHERE id = ?",
      [userId, draft.id]
    );

    await connection.commit();

    // Broadcast boundary published event
    websocketServer.broadcastBoundaryPublished(
      regionId,
      draft.region_name,
      userId,
      draft.version_number
    );

    // Notify all admins of the boundary change
    await notifyAllAdmins(
      'boundary_update',
      `Region Boundary Updated: ${draft.region_name}`,
      `User ID ${userId} published version ${draft.version_number} for the boundary of ${draft.region_name}.`,
      { related_entity_id: regionId, related_entity_type: 'region' }
    );

    return { id: draft.id, versionNumber: draft.version_number };
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
};

const unpublishBoundary = async (regionId, userId) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    // 1. Get the current published boundary data (we need to copy it to a draft)
    const [published] = await connection.query(
      `SELECT id, boundary_geojson, boundary_type, vertex_count, 
              notes, change_reason, source, version_number
       FROM boundary_versions 
       WHERE region_id = ? AND status = 'published' 
       LIMIT 1`,
      [regionId]
    );

    // 2. Check if user already has a draft for this region
    const [existingDrafts] = await connection.query(
      "SELECT id FROM boundary_versions WHERE region_id = ? AND status = 'draft'",
      [regionId]
    );

    // 3. If we have a published boundary AND no existing draft, create a draft copy
    if (published.length > 0 && existingDrafts.length === 0) {
      const pub = published[0];
      
      // Get next version number for the draft
      const [maxVer] = await connection.query(
        "SELECT MAX(version_number) as max_version FROM boundary_versions WHERE region_id = ?",
        [regionId]
      );
      const nextVersion = (maxVer[0].max_version || 0) + 1;

      // Create a draft copy with the same boundary data
      await connection.query(
        `INSERT INTO boundary_versions
         (region_id, boundary_geojson, boundary_type, vertex_count, version_number, 
          status, created_by, notes, change_reason, source)
         VALUES (?, ?::jsonb, ?, ?, ?, 'draft', ?, ?, ?, ?)`,
        [
          regionId,
          typeof pub.boundary_geojson === 'string' 
            ? pub.boundary_geojson 
            : JSON.stringify(pub.boundary_geojson),
          pub.boundary_type,
          pub.vertex_count || 0,
          nextVersion,
          userId,
          pub.notes || null,
          'Unpublished — continuing from previous boundary',
          pub.source || 'Manual Drawing',
        ]
      );
    }

    // 4. Archive the published boundary (remove from map)
    await connection.query(
      "UPDATE boundary_versions SET status = 'archived' WHERE region_id = ? AND status = 'published'",
      [regionId]
    );

    await connection.commit();

    return {
      draftCreated: published.length > 0 && existingDrafts.length === 0,
      hadExistingDraft: existingDrafts.length > 0,
    };
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
};

module.exports = {
  getVersionDetails,
  isOnlyPublishedVersion,
  deleteVersion,
  getDeletionCounts,
  deleteAllBoundaryData,
  publishDraft,
  unpublishBoundary,
};
