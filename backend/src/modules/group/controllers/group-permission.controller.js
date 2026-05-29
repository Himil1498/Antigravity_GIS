/**
 * Group Permission Controller
 * Handles group permission management
 */

const { pool } = require("../../../config/database");
const { ERRORS } = require("../constants");
const { logAudit } = require("../../audit/audit.service");

/**
 * @route   GET /api/groups/:groupId/permissions
 * @desc    Get permissions assigned to a group
 * @access  Private (Group members)
 */
const getGroupPermissions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if user is a member or admin
    const [membership] = await pool.query(
      "SELECT role FROM group_members WHERE group_id = ? AND user_id = ?",
      [groupId, userId],
    );

    const isAdmin = req.user.role === "admin";

    if (membership.length === 0 && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: ERRORS.NOT_AUTHORIZED_VIEW_PERMISSIONS,
      });
    }

    // Get group permissions
    const [permissions] = await pool.query(
      `SELECT gp.*, u.username as granted_by_username
       FROM group_permissions gp
       LEFT JOIN users u ON gp.granted_by = u.id
       WHERE gp.group_id = ?
       ORDER BY gp.granted_at DESC`,
      [groupId],
    );

    res.json({
      success: true,
      permissions: permissions.map((p) => p.permission_id),
      details: permissions,
    });
  } catch (error) {
    console.error("Get group permissions error:", error);
    res.status(500).json({
      success: false,
      error: ERRORS.FAILED_TO_GET_PERMISSIONS,
    });
  }
};

/**
 * @route   PUT /api/groups/:groupId/permissions
 * @desc    Update group permissions
 * @access  Private (Group owner/admin or system admin)
 */
const updateGroupPermissions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { permissions } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user is group owner/admin or system admin
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

    const isGroupOwner = group[0].created_by === userId;
    const isGroupAdmin =
      membership.length > 0 && membership[0].role === "admin";
    const isSystemAdmin = userRole === "admin";

    if (!isGroupOwner && !isGroupAdmin && !isSystemAdmin) {
      return res.status(403).json({
        success: false,
        error: ERRORS.NOT_AUTHORIZED_UPDATE_PERMISSIONS,
      });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        error: ERRORS.PERMISSIONS_MUST_BE_ARRAY,
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete existing permissions
      await connection.query(
        "DELETE FROM group_permissions WHERE group_id = ?",
        [groupId],
      );

      // Insert new permissions
      if (permissions.length > 0) {
        const values = permissions.map((permId) => [groupId, permId, userId]);
        await connection.query(
          "INSERT INTO group_permissions (group_id, permission_id, granted_by) VALUES ?",
          [values],
        );
      }

      await connection.commit();
      connection.release();

      // Audit
      try {
        await logAudit(
          userId,
          "Update Group Permissions",
          "GROUP_PERMISSION_UPDATE",
          groupId,
          { permissions, count: permissions.length },
          req,
        );
      } catch (e) {
        console.error("Audit log failed", e);
      }

      res.json({
        success: true,
        message: `Updated ${permissions.length} permission(s) for group`,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Update group permissions error:", error);
    res.status(500).json({
      success: false,
      error: ERRORS.FAILED_TO_UPDATE_PERMISSIONS,
    });
  }
};

module.exports = {
  getGroupPermissions,
  updateGroupPermissions,
};
