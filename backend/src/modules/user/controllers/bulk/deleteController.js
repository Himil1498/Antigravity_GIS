const { pool } = require("../../../../config/database");
const { logAudit } = require("../../../audit/audit.service");
const { AUDIT_ACTIONS, ERROR_MESSAGES } = require("./constants");

/**
 * @route   DELETE /api/users/bulk-delete
 * @desc    Bulk delete users
 * @access  Private (Admin)
 */
const bulkDeleteUsers = async (req, res) => {
  try {
    const { user_ids } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: ERROR_MESSAGES.USER_IDS_REQUIRED });
    }

    // Don't allow deleting self
    if (user_ids.includes(req.user.id)) {
      return res
        .status(400)
        .json({ success: false, error: ERROR_MESSAGES.CANNOT_DELETE_SELF });
    }

    // Delete users with cascade simulation
    const placeholders = user_ids.map(() => "?").join(",");

    const client = await pool.getConnection();
    try {
      await client.beginTransaction();

      // 1. Remove from Group Memberships
      await client.query(
        `DELETE FROM group_members WHERE user_id IN (${placeholders})`,
        user_ids,
      );

      // 2. Remove Folder Access
      await client.query(
        `DELETE FROM user_folder_access WHERE user_id IN (${placeholders})`,
        user_ids,
      );

      // 3. Remove Region Assignments
      await client.query(
        `DELETE FROM user_regions WHERE user_id IN (${placeholders})`,
        user_ids,
      );

      // 4. Remove Refresh Tokens / Sessions (if stored in DB)
      // (Assuming session table exists or logic is stateless/redis)

      // 5. Finally Delete Users
      const [result] = await client.query(
        `DELETE FROM users WHERE id IN (${placeholders})`,
        user_ids,
      );

      await client.commit();

      // Log audit
      await logAudit(
        req.user.id,
        AUDIT_ACTIONS.BULK_DELETE,
        "user",
        null,
        {
          action: "bulk_delete",
          user_ids,
          count: result.affectedRows,
        },
        req,
      );

      res.json({
        success: true,
        count: result.affectedRows,
        message: `${result.affectedRows} user(s) deleted successfully`,
      });
    } catch (err) {
      await client.rollback();
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Bulk delete users error:", error);
    res
      .status(500)
      .json({ success: false, error: ERROR_MESSAGES.BULK_DELETE_FAILED });
  }
};

module.exports = { bulkDeleteUsers };
