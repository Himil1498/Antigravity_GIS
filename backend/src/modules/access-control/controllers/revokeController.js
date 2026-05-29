/**
 * Revoke Temporary Access Controller
 * Handles revoking temporary access
 */

const { pool } = require("../../../config/database");
const { logAudit } = require("../../audit/audit.service");
const {
  createNotification,
} = require("../../notification/services/notification.service");
const { ERRORS, SUCCESS } = require("../constants");

/**
 * @route   DELETE /api/temporary-access/:id
 * @desc    Delete/Revoke temporary access (manager+)
 * @access  Private (Manager/Admin)
 */
const revokeTemporaryAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role?.toLowerCase(); // Case-insensitive role check

    // Permission check is now handled by middleware (checkPermission('admin:temp_access'))


    // Get the grant details before deleting
    const [access] = await pool.query(
      `SELECT ta.user_id, ta.region_id,  ta.reason as grant_reason,
              u.username, u.full_name, u.email,
              r.name as region_name
       FROM temporary_access_log ta
       INNER JOIN users u ON ta.user_id = u.id
       INNER JOIN regions r ON ta.region_id = r.id
       WHERE ta.id = ?`,
      [id],
    );

    if (access.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.ACCESS_NOT_FOUND });
    }

    const grantUserId = access[0].user_id;
    const grantResourceId = access[0].region_id;
    const targetUser = {
      id: access[0].user_id,
      username: access[0].username,
      full_name: access[0].full_name,
      email: access[0].email,
    };
    const regionName = access[0].region_name;

    // Delete the temporary access record from database
    await pool.query("DELETE FROM temporary_access_log WHERE id = ?", [id]);

    // Log audit event for revocation
    try {
      await logAudit(
        userId,
        `Revoked temporary access to ${regionName} for ${targetUser.full_name}`,
        "REGION_REVOKED",
        null,
        {
          severity: "warning",
          resource_name: regionName,
          target_user_id: grantUserId,
          target_username: targetUser.username,
          target_user_name: targetUser.full_name,
          grant_id: id,
          revoked_by_role: userRole,
          success: true,
        },
        req,
      );
    } catch (auditError) {
      console.error("Failed to create audit log for revocation:", auditError);
    }

    // Notify the user about temporary access revoked
    try {
      await createNotification(
        grantUserId,
        "region_request",
        "🔒 Temporary Access Revoked",
        `Your temporary access to ${regionName} has been revoked`,
        {
          data: {
            grantId: id,
            regionId: grantResourceId,
            regionName,
            revokedBy: userId,
          },
          priority: "high",
          action_url: "/temporary-access",
          action_label: "View Access",
        },
      );
    } catch (notifError) {
      console.error("Failed to send notification to user:", notifError);
    }

    // Remove from user_regions table (only if no other active temporary access exists)
    const [otherTemp] = await pool.query(
      `SELECT id FROM temporary_access_log
       WHERE user_id = ? AND region_id = ?
       AND status != 'revoked' AND end_time > NOW()`,
      [grantUserId, grantResourceId],
    );

    // If no other temporary access, remove from user_regions
    if (otherTemp.length === 0) {
      await pool.query(
        "DELETE FROM user_regions WHERE user_id = ? AND region_id = ?",
        [grantUserId, grantResourceId],
      );
    }

    res.json({ success: true, message: SUCCESS.REVOKE_SUCCESS });
  } catch (error) {
    console.error("Delete temporary access error:", error);
    res.status(500).json({ success: false, error: ERRORS.REVOKE_FAILED });
  }
};

module.exports = { revokeTemporaryAccess };
