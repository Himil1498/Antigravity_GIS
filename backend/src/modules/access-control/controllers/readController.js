/**
 * Read Temporary Access Controller
 * Handles retrieving temporary access data
 */

const { pool } = require("../../../config/database");
const { calculateTimeRemaining } = require("../utils");
const { ERRORS } = require("../constants");

/**
 * @route   GET /api/temporary-access
 * @desc    Get all temporary access grants (admin/manager)
 * @access  Private (Admin/Manager)
 */
const getAllTemporaryAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    // Role check removed in favor of checkPermission middleware


    const { status, user_id } = req.query;

    let query = `
      SELECT ta.*,
             u.username,
             u.full_name,
             u.email,
             r.name as region_name,
             r.code as region_code,
             granter.username as granted_by_username,
             EXTRACT(EPOCH FROM (ta.end_time - NOW())) as seconds_remaining
      FROM temporary_access_log ta
      INNER JOIN users u ON ta.user_id = u.id
      INNER JOIN regions r ON ta.region_id = r.id
      INNER JOIN users granter ON ta.granted_by = granter.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      if (status === "active") {
        query += " AND ta.status != 'revoked' AND ta.end_time > NOW()";
      } else if (status === "revoked") {
        query += " AND ta.status = 'revoked'";
      } else if (status === "expired") {
        query += " AND ta.status != 'revoked' AND ta.end_time <= NOW()";
      }
    }

    if (user_id) {
      query += " AND ta.user_id = ?";
      params.push(user_id);
    }

    query += " ORDER BY ta.start_time DESC";

    const [access] = await pool.query(query, params);

    // Add time remaining calculation and map fields for frontend
    const accessWithTimeRemaining = access.map((grant) => ({
      ...grant,
      granted_at: grant.start_time,
      expires_at: grant.end_time,
      time_remaining: calculateTimeRemaining(grant.seconds_remaining),
    }));

    res.json({ success: true, access: accessWithTimeRemaining });
  } catch (error) {
    console.error("Get temporary access error:", error);
    res.status(500).json({ success: false, error: ERRORS.GET_FAILED });
  }
};

/**
 * @route   GET /api/temporary-access/my-access
 * @desc    Get current user's active temporary access
 * @access  Private
 */
const getMyTemporaryAccess = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT ta.*,
             r.name as region_name,
             r.code as region_code,
             r.type as region_type,
             granter.username as granted_by_username,
             granter.full_name as granted_by_name,
             EXTRACT(EPOCH FROM (ta.end_time - NOW())) as seconds_remaining
      FROM temporary_access_log ta
      INNER JOIN regions r ON ta.region_id = r.id
      INNER JOIN users granter ON ta.granted_by = granter.id
      WHERE ta.user_id = ?
        
        AND ta.status != 'revoked'
        AND ta.end_time > NOW()
      ORDER BY ta.end_time ASC
    `;

    const [access] = await pool.query(query, [userId]);

    // Add time remaining calculation and map fields for frontend
    const accessWithTimeRemaining = access.map((grant) => ({
      ...grant,
      granted_at: grant.start_time,
      expires_at: grant.end_time,
      time_remaining: calculateTimeRemaining(grant.seconds_remaining),
    }));

    res.json({
      success: true,
      access: accessWithTimeRemaining,
      count: accessWithTimeRemaining.length,
    });
  } catch (error) {
    console.error("Get my temporary access error:", error);
    res.status(500).json({ success: false, error: ERRORS.GET_FAILED });
  }
};

/**
 * @route   GET /api/temporary-access/current-regions
 * @desc    Get user's currently valid regions (permanent + non-expired temporary)
 * @access  Private
 */
const getCurrentValidRegions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Step 1: Get all region IDs that have EVER had temporary access
    const [allTempRegions] = await pool.query(
      `SELECT DISTINCT region_id FROM temporary_access_log WHERE user_id = ?`,
      [userId],
    );
    const everTempRegionIds = allTempRegions.map((ta) => ta.region_id);

    // Step 2: Get all active temporary access (currently valid)
    const [activeTempAccess] = await pool.query(
      `SELECT region_id, end_time, EXTRACT(EPOCH FROM (end_time - NOW())) as seconds_remaining FROM temporary_access_log WHERE user_id = ?
       AND status != 'revoked' AND end_time > NOW()`,
      [userId],
    );
    const activeTempRegionIds = activeTempAccess.map((ta) => ta.region_id);
    const tempRegionMap = new Map(
      activeTempAccess.map((ta) => [
        ta.region_id,
        { expires_at: ta.end_time, seconds_remaining: ta.seconds_remaining },
      ]),
    );

    // Step 3: Get ALL regions from user_regions
    const query = `
      SELECT DISTINCT
        r.id,
        r.name,
        r.code,
        r.type,
        ur.access_level
      FROM regions r
      INNER JOIN user_regions ur ON r.id = ur.region_id
      WHERE ur.user_id = ?
        AND r.is_active = true
      ORDER BY r.name ASC
    `;

    const [regions] = await pool.query(query, [userId]);

    // Step 4: Filter and categorize regions
    const regionsWithDetails = regions
      .filter((region) => {
        // If this region was EVER temporary
        if (everTempRegionIds.includes(region.id)) {
          // Only include if it has ACTIVE temporary access now
          return activeTempRegionIds.includes(region.id);
        }
        // If never had temporary access, it's permanent - always include
        return true;
      })
      .map((region) => {
        const isTemporary = activeTempRegionIds.includes(region.id);
        const tempData = tempRegionMap.get(region.id);

        return {
          id: region.id,
          name: region.name,
          code: region.code,
          type: region.type,
          access_level: region.access_level,
          is_temporary: isTemporary,
          expires_at: isTemporary && tempData ? tempData.end_time : null,
          time_remaining:
            isTemporary && tempData
              ? calculateTimeRemaining(tempData.seconds_remaining)
              : null,
        };
      });

    res.json({
      success: true,
      regions: regionsWithDetails,
      count: regionsWithDetails.length,
    });
  } catch (error) {
    console.error("Get current valid regions error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get current regions" });
  }
};

module.exports = {
  getAllTemporaryAccess,
  getMyTemporaryAccess,
  getCurrentValidRegions,
};
