const { pool } = require("../../../../config/database");
const { logAudit } = require("../../../audit/audit.service");
const { createNotification, notifyAllAdmins } = require("../../../notification/services/notification.service");
const { AUDIT_ACTIONS, ERROR_MESSAGES } = require("./constants");

/**
 * @route   PATCH /api/users/bulk-status
 * @desc    Bulk update user status (activate/deactivate multiple users)
 * @access  Private (Admin)
 */
const bulkUpdateStatus = async (req, res) => {
  try {
    const { user_ids, is_active } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: ERROR_MESSAGES.USER_IDS_REQUIRED });
    }

    if (typeof is_active !== "boolean") {
      return res
        .status(400)
        .json({ success: false, error: ERROR_MESSAGES.IS_ACTIVE_BOOLEAN });
    }

    // Don't allow deactivating self
    if (!is_active && user_ids.includes(req.user.id)) {
      return res
        .status(400)
        .json({ success: false, error: ERROR_MESSAGES.CANNOT_DEACTIVATE_SELF });
    }

    // Update user status
    const placeholders = user_ids.map(() => "?").join(",");
    const [result] = await pool.query(
      `UPDATE users SET is_active = ? WHERE id IN (${placeholders})`,
      [is_active, ...user_ids]
    );

    // Log audit
    const action = is_active ? "activated" : "deactivated";
    await logAudit(
      req.user.id,
      AUDIT_ACTIONS.BULK_STATUS_UPDATE,
      "user",
      null,
      {
        action: `bulk_${action}`,
        user_ids,
        is_active,
        count: result.affectedRows,
      },
      req
    );

    res.json({
      success: true,
      count: result.affectedRows,
      message: `${result.affectedRows} user(s) ${action} successfully`,
    });
  } catch (error) {
    console.error("Bulk update status error:", error);
    res
      .status(500)
      .json({ success: false, error: ERROR_MESSAGES.BULK_STATUS_FAILED });
  }
};

module.exports = { bulkUpdateStatus };
