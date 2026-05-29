/**
 * Group Region Controller
 * Handles group region assignments
 */

const { pool } = require("../../config/database");
const { ERRORS } = require("./constants");

/**
 * @route   GET /api/groups/:groupId/regions
 * @desc    Get regions assigned to group
 * @access  Private (Group members)
 */
const getGroupRegions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check membership or admin
    const [membership] = await pool.query(
      "SELECT id FROM group_members WHERE group_id = ? AND user_id = ?",
      [groupId, userId],
    );

    if (membership.length === 0 && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: ERRORS.NOT_AUTHORIZED_VIEW_REGIONS,
      });
    }

    // Get group regions
    const [regions] = await pool.query(
      `SELECT gr.*, r.name, r.code, r.type,
              u.username as assigned_by_username
       FROM group_regions gr
       INNER JOIN regions r ON gr.region_id = r.id
       LEFT JOIN users u ON gr.assigned_by = u.id
       WHERE gr.group_id = ?
       ORDER BY r.name`,
      [groupId],
    );

    res.json({ success: true, regions });
  } catch (error) {
    console.error("Get group regions error:", error);
    res.status(500).json({
      success: false,
      error: ERRORS.FAILED_TO_GET_REGIONS,
    });
  }
};

/**
 * @route   PUT /api/groups/:groupId/regions
 * @desc    Update group region assignments
 * @access  Private (Group owner/admin or system admin)
 */
const updateGroupRegions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { regionIds } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check authorization
    const [group] = await pool.query(
      'SELECT created_by FROM "groups" WHERE id = ?',
      [groupId],
    );

    if (group.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.GROUP_NOT_FOUND });
    }

    const [membership] = await pool.query(
      "SELECT role FROM group_members WHERE group_id = ? AND user_id = ?",
      [groupId, userId],
    );

    const isAuthorized =
      group[0].created_by === userId ||
      (membership.length > 0 && membership[0].role === "admin") ||
      userRole === "admin";

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: ERRORS.NOT_AUTHORIZED_UPDATE_REGIONS,
      });
    }

    if (!Array.isArray(regionIds)) {
      return res.status(400).json({
        success: false,
        error: ERRORS.REGION_IDS_MUST_BE_ARRAY,
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete existing region assignments
      await connection.query("DELETE FROM group_regions WHERE group_id = ?", [
        groupId,
      ]);

      // Insert new region assignments
      if (regionIds.length > 0) {
        const values = regionIds.map((regionId) => [groupId, regionId, userId]);
        await connection.query(
          "INSERT INTO group_regions (group_id, region_id, assigned_by) VALUES ?",
          [values],
        );
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: `Updated ${regionIds.length} region(s) for group`,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Update group regions error:", error);
    res.status(500).json({
      success: false,
      error: ERRORS.FAILED_TO_UPDATE_REGIONS,
    });
  }
};

module.exports = {
  getGroupRegions,
  updateGroupRegions,
};
