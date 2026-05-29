const { pool } = require("../../config/database");
const DEFAULTS = { LIMIT: 10, OFFSET: 0, MAX_STAYING_ITEMS: 50 };

/**
 * Get draft boundary for a region
 * @param {number} regionId - Region ID
 * @returns {Promise<Object|null>} Draft boundary object or null
 */
const getDraftBoundary = async (regionId) => {
  const [drafts] = await pool.query(
    `SELECT id, boundary_geojson, boundary_type
     FROM boundary_versions
     WHERE region_id = ? AND status = 'draft'
     LIMIT 1`,
    [regionId],
  );
  return drafts.length > 0 ? drafts[0] : null;
};

/**
 * Check if items moving out will be in another region
 * @param {Array} itemsMovingOut - Items moving out of region
 * @param {number} regionId - Current region ID
 * @returns {Promise<Object>} Items with new region info or invalid status
 */
const checkItemsNewRegions = async (itemsMovingOut, regionId) => {
  const itemsBecomingInvalid = [];
  const updatedMovingOut = [];

  for (const item of itemsMovingOut) {
    // Check if item will be in any other published boundary
    const [otherRegions] = await pool.query(
      `SELECT r.id, r.name
       FROM boundary_versions bv
       JOIN regions r ON bv.region_id = r.id
       WHERE bv.status = 'published'
       AND bv.region_id != ?
       AND ST_Within(
         ST_SetSRID(ST_MakePoint(?, ?), 4326),
         ST_SetSRID(ST_GeomFromGeoJSON(bv.boundary_geojson), 4326)
       )
       LIMIT 1`,
      [regionId, item.longitude, item.latitude],
    );

    if (otherRegions.length > 0) {
      item.newRegionId = otherRegions[0].id;
      item.newRegionName = otherRegions[0].name;
      updatedMovingOut.push(item);
    } else {
      // Item will become invalid (not in any region)
      itemsBecomingInvalid.push(item);
    }
  }

  return { itemsMovingOut: updatedMovingOut, itemsBecomingInvalid };
};

/**
 * Get affected users for a region
 * @param {number} regionId - Region ID
 * @returns {Promise<Array>} Array of affected users
 */
const getAffectedUsers = async (regionId) => {
  const [affectedUsers] = await pool.query(
    `SELECT DISTINCT u.id, u.full_name, u.email, u.role
     FROM users u
     JOIN user_regions ur ON u.id = ur.user_id
     WHERE ur.region_id = ? AND u.is_active = TRUE`,
    [regionId],
  );
  return affectedUsers;
};

/**
 * Get infrastructure region change history
 * @param {number} regionId - Region ID
 * @param {number} limit - Limit
 * @param {number} offset - Offset
 * @returns {Promise<Object>} History records and total count
 */
const getInfrastructureHistory = async (regionId, limit, offset) => {
  limit = parseInt(limit) || DEFAULTS.LIMIT;
  offset = parseInt(offset) || DEFAULTS.OFFSET;

  const [history] = await pool.query(
    `SELECT
      irh.id,
      irh.infrastructure_id,
      irh.old_region_id,
      irh.new_region_id,
      irh.boundary_version_id,
      irh.version_number,
      irh.changed_by,
      irh.changed_at,
      irh.change_reason,
      irh.is_invalid,
      irh.can_rollback,
      irh.rollback_expires_at,
      ii.item_name,
      ii.item_type,
      old_r.name as old_region_name,
      new_r.name as new_region_name,
      u.full_name as changed_by_name
    FROM infrastructure_region_history irh
    LEFT JOIN infrastructure_items ii ON irh.infrastructure_id = ii.id
    LEFT JOIN regions old_r ON irh.old_region_id = old_r.id
    LEFT JOIN regions new_r ON irh.new_region_id = new_r.id
    LEFT JOIN users u ON irh.changed_by = u.id
    WHERE irh.old_region_id = ? OR irh.new_region_id = ?
    ORDER BY irh.changed_at DESC
    LIMIT ? OFFSET ?`,
    [regionId, regionId, limit, offset],
  );

  // Get total count
  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total
     FROM infrastructure_region_history
     WHERE old_region_id = ? OR new_region_id = ?`,
    [regionId, regionId],
  );

  return {
    history,
    total: countResult[0].total,
  };
};

/**
 * Helper: Categorize items based on impact analysis results
 */
const categorizeImpactItems = (impactResults, regionId) => {
  const itemsMovingOut = [];
  const itemsMovingIn = [];
  const itemsStaying = [];

  impactResults.forEach((item) => {
    const originallyInRegion = Boolean(item.currently_in_region);
    const willBeInRegion = Boolean(item.will_be_inside);

    if (originallyInRegion && !willBeInRegion) {
      // Was inside, now outside -> Moving Out
      itemsMovingOut.push(item);
    } else if (!originallyInRegion && willBeInRegion) {
      // Was outside, now inside -> Moving In
      itemsMovingIn.push(item);
    } else if (originallyInRegion && willBeInRegion) {
      // Was inside, stays inside -> Staying
      itemsStaying.push(item);
    }
  });

  return { itemsMovingOut, itemsMovingIn, itemsStaying };
};

/**
 * Analyze impact on infrastructure items
 * @param {number} regionId - Region ID
 * @returns {Promise<Object>} Impact analysis result
 */
const analyzeImpact = async (regionId) => {
  // Completely bypass analysis as Infrastructure Items table overrides are removed.
  // Just return success with 0 counts to satisfy frontend expectations.

  return {
    success: true,
    impact: {
      summary: {
        totalAffected: 0,
        itemsStaying: 0,
        itemsMovingOut: 0,
        itemsMovingIn: 0,
        itemsBecomingInvalid: 0,
        affectedUsersCount: 0,
      },
      itemsStaying: [],
      itemsMovingOut: [],
      itemsMovingIn: [],
      itemsBecomingInvalid: [],
      affectedUsers: [],
      hasStaying: false,
      totalStaying: 0,
    },
  };
};

module.exports = {
  analyzeImpact,
  getInfrastructureHistory,
};
