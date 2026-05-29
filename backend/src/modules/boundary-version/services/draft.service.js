const { pool } = require("../../../config/database");

const STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

const DEFAULTS = {
  CHANGE_REASON: "Initial creation",
  SOURCE: "Manual Drawing",
};

const checkExistingDraft = async (regionId, userId = null) => {
  let query =
    "SELECT id, version_number FROM boundary_versions WHERE region_id = ? AND status = ?";
  let params = [regionId, STATUS.DRAFT];

  if (userId) {
    query += " AND created_by = ?";
    params.push(userId);
  }

  const [existingDrafts] = await pool.query(query, params);
  return existingDrafts;
};

const getNextVersionNumber = async (regionId) => {
  const [maxVersion] = await pool.query(
    "SELECT MAX(version_number) as max_version FROM boundary_versions WHERE region_id = ?",
    [regionId],
  );
  return (maxVersion[0].max_version || 0) + 1;
};

const createDraft = async (draftData) => {
  const {
    regionId,
    boundaryGeoJSON,
    vertexCount,
    versionNumber,
    userId,
    notes,
    changeReason,
    source,
  } = draftData;

  const [result] = await pool.query(
    `INSERT INTO boundary_versions
     (region_id, boundary_geojson, boundary_type, vertex_count, version_number, status, created_by, notes, change_reason, source)
     VALUES (?, ?::jsonb, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      regionId,
      JSON.stringify(boundaryGeoJSON),
      boundaryGeoJSON.type,
      vertexCount,
      versionNumber,
      STATUS.DRAFT,
      userId,
      notes || null,
      changeReason || DEFAULTS.CHANGE_REASON,
      source || DEFAULTS.SOURCE,
    ],
  );

  let newId;
  if (result && result.length > 0) {
    newId = result[0].id;
  } else {
    // Fallback: Fetch the ID
    const [rows] = await pool.query(
      "SELECT id FROM boundary_versions WHERE region_id = ? AND version_number = ?",
      [regionId, versionNumber],
    );
    if (rows.length > 0) {
      newId = rows[0].id;
    }
  }

  if (!newId) {
    throw new Error("Failed to retrieve draft ID");
  }

  return {
    id: newId,
    versionNumber,
  };
};

const updateDraft = async (draftData) => {
  const { draftId, boundaryGeoJSON, vertexCount, notes, changeReason, source } =
    draftData;

  await pool.query(
    `UPDATE boundary_versions
     SET boundary_geojson = ?,
         boundary_type = ?,
         vertex_count = ?,
         notes = ?,
         change_reason = ?,
         source = ?
     WHERE id = ?`,
    [
      JSON.stringify(boundaryGeoJSON),
      boundaryGeoJSON.type,
      vertexCount,
      notes || null,
      changeReason || DEFAULTS.CHANGE_REASON,
      source || DEFAULTS.SOURCE,
      draftId,
    ],
  );
};

const deleteDraft = async (draftId) => {
  await pool.query("DELETE FROM boundary_versions WHERE id = ?", [draftId]);
};

const getSourceVersion = async (versionId, regionId) => {
  const [sourceVersions] = await pool.query(
    "SELECT * FROM boundary_versions WHERE id = ? AND region_id = ?",
    [versionId, regionId],
  );
  return sourceVersions.length > 0 ? sourceVersions[0] : null;
};

const getDraftDetail = async (regionId, userId) => {
  const [drafts] = await pool.query(
    `
        SELECT bv.*, u.full_name as created_by_name 
        FROM boundary_versions bv
        LEFT JOIN users u ON bv.created_by = u.id
        WHERE bv.region_id = ? AND bv.status = 'draft' AND bv.created_by = ?
        LIMIT 1
    `,
    [regionId, userId],
  );
  return drafts.length > 0 ? drafts[0] : null;
};

const publishBoundaryDirect = async (
  regionId,
  userId,
  boundaryGeoJSON,
  publishReason,
) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get next version number
    const versionNumber = await getNextVersionNumber(regionId);

    // Get region name for WebSocket broadcast
    const [regions] = await connection.query(
      "SELECT name FROM regions WHERE id = ?",
      [regionId],
    );
    const regionName = regions.length > 0 ? regions[0].name : "Unknown Region";

    // Create published version directly
    const [result] = await connection.query(
      `INSERT INTO boundary_versions
       (region_id, boundary_geojson, boundary_type, vertex_count, version_number, status, created_by, published_by, published_at, notes, change_reason, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?) RETURNING id`,
      [
        regionId,
        JSON.stringify(boundaryGeoJSON),
        boundaryGeoJSON.type,
        boundaryGeoJSON.coordinates ? boundaryGeoJSON.coordinates[0].length : 0, // vertex count approximation
        versionNumber,
        STATUS.PUBLISHED,
        userId,
        userId,
        publishReason || "Direct publish from editor",
        "Direct Publish",
        "Region Boundary Editor",
      ],
    );

    // Archive previous published versions
    await connection.query(
      "UPDATE boundary_versions SET status = ? WHERE region_id = ? AND status = ? AND id != ?",
      [STATUS.ARCHIVED, regionId, STATUS.PUBLISHED, result[0].id],
    );

    await connection.commit();

    return { id: result[0].id, versionNumber };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  checkExistingDraft,
  getNextVersionNumber,
  createDraft,
  updateDraft,
  deleteDraft,
  getSourceVersion,
  getDraftDetail,
  publishBoundaryDirect,
  STATUS,
};
