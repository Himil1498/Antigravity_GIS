const userService = require("../user.service");
const { pool } = require("../../../config/database"); // Needed for direct query in service substitute if not moved
const { logAudit } = require("../../audit/audit.service");
const {
  notifyAllAdmins,
} = require("../../notification/services/notification.service");
const {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  AUDIT_ACTIONS,
} = require("./constants");

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
// Helper to safely delete from a table, ignoring "table not found" errors
// Helper to safely delete from a table, ignoring "table not found" errors
const safeDelete = async (
  connection,
  tableName,
  userId,
  columnName = "user_id",
) => {
  try {
    // Create a savepoint so we can rollback just this statement if it fails
    // without aborting the entire transaction
    await connection.query(`SAVEPOINT safe_delete_${tableName}`);

    // Wrapper expects '?' and converts to '$1'
    await connection.query(
      `DELETE FROM "${tableName}" WHERE "${columnName}" = ?`,
      [userId],
    );

    // Release savepoint if successful
    await connection.query(`RELEASE SAVEPOINT safe_delete_${tableName}`);
  } catch (error) {
    // Rollback to savepoint to restore transaction state
    try {
      await connection.query(`ROLLBACK TO SAVEPOINT safe_delete_${tableName}`);
    } catch (rbError) {
      console.error(`Failed to rollback savepoint for ${tableName}:`, rbError);
    }

    // Ignore "undefined_table" (42P01) errors or "undefined_column" (42703) if we guessed wrong
    if (error.code === "42P01" || error.code === "42703") {
      console.warn(
        `Skipping deletion for table/column issue: ${tableName}.${columnName} - Code: ${error.code}`,
      );
    } else {
      console.error(`Error deleting from ${tableName}:`, error);
      // We generally want to continue even if one cleanup fails (e.g. non-critical data),
      // but critical FK violations will eventually block the user delete anyway.
      // Re-throwing here is cleaner for debugging if it's NOT a known ignorable error.
      throw error;
    }
  }
};

const deleteUser = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    if (req.user.id === parseInt(id)) {
      return res
        .status(400)
        .json({ success: false, error: ERROR_MESSAGES.CANNOT_DELETE_SELF });
    }

    // Get a connection for transaction
    connection = await pool.getConnection();

    // START TRANSACTION
    await connection.beginTransaction();

    // 1. Check if user exists
    // Wrapper returns [rows, fields], so we destructure [rows]
    const [rows] = await connection.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);
    const deletedUser = rows[0];

    if (!deletedUser) {
      await connection.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, error: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    // 2. Delete related operational data (Safe Deletes)
    // We list ALL potential tables that reference user_id to avoid FK constraints.
    const tablesToDelete = [
      "user_permissions",
      "user_roles", // In case it exists in some versions
      "user_sessions", // Stores tokens
      "refresh_tokens", // Legacy name
      "mfa_tokens",
      "passwords_reset_requests",
      "email_verifications",
      "group_members",
      "user_map_preferences",
      "layer_management",
      "layers",
      "user_regions",
      "region_requests",
      "temporary_access_log",
      { name: "search_history", column: "user_id" }, // showing object syntax works
      "notifications",
      "bookmarks",
      "api_performance_logs",
      "analytics_events",
      "dev_error_logs",
      "dev_tool_error_logs",
      "sector_rf_data",
      "data_hub_exports",
      "user_settings",
      { name: "network_files", column: "uploaded_by" }, // Custom column name
      "support_tickets",
      { name: "network_features", column: "deleted_by" },
      "custom_reports",
    ];

    for (const entry of tablesToDelete) {
      const tableName = typeof entry === "string" ? entry : entry.name;
      const columnName = typeof entry === "string" ? "user_id" : entry.column;
      await safeDelete(connection, tableName, id, columnName);
    }

    // Anonymize audit logs (Set user_id to NULL instead of deleting history)
    try {
      await connection.query("SAVEPOINT safe_audit_logs");
      await connection.query(
        "UPDATE audit_logs SET user_id = NULL WHERE user_id = ?",
        [id],
      );
      await connection.query("RELEASE SAVEPOINT safe_audit_logs");
    } catch (error) {
      try { await connection.query("ROLLBACK TO SAVEPOINT safe_audit_logs"); } catch (e) {}
      if (error.code !== "42P01") throw error; // Ignore if table missing
    }

    // Anonymize network folders created by the user to avoid FK constraint violations
    try {
      await connection.query("SAVEPOINT safe_network_folders");
      await connection.query(
        "UPDATE network_folders SET created_by = NULL WHERE created_by = ?",
        [id],
      );
      // updated_by does not exist on network_folders, so we only clear created_by
      await connection.query("RELEASE SAVEPOINT safe_network_folders");
    } catch (error) {
      try { await connection.query("ROLLBACK TO SAVEPOINT safe_network_folders"); } catch (e) {}
      if (error.code !== "42P01" && error.code !== "42703") throw error; 
    }

    // 3. Delete the user
    await connection.query("DELETE FROM users WHERE id = ?", [id]);

    // 4. Commit transaction
    await connection.query("COMMIT");

    // 5. Log Audit
    await logAudit(
      req.user.id,
      AUDIT_ACTIONS.DELETE,
      "user",
      id,
      {
        username: deletedUser.username,
        email: deletedUser.email,
        full_name: deletedUser.full_name,
        role: deletedUser.role,
      },
      req,
    );

    try {
      const deletedByName =
        req.user?.full_name || req.user?.username || "Administrator";
      const deletedUserName =
        deletedUser.full_name || deletedUser.username || "User";

      await notifyAllAdmins(
        AUDIT_ACTIONS.USER_ACTIVITY,
        "🗑️ User Deleted",
        `${deletedByName} deleted user ${deletedUserName} (${deletedUser.email}) with role: ${deletedUser.role}`,
        {
          data: {
            userId: id,
            username: deletedUser.username,
            email: deletedUser.email,
            fullName: deletedUser.full_name,
            role: deletedUser.role,
            deletedBy: deletedByName,
          },
          priority: "high",
          action_url: "/admin/users",
          action_label: "View Users",
        },
      );
      console.log(`📧 Admins notified about user deletion: ${deletedUserName}`);
    } catch (notifError) {
      console.error("Failed to notify admins about user deletion:", notifError);
    }

    res.json({ success: true, message: SUCCESS_MESSAGES.USER_DELETED });
  } catch (error) {
    if (connection) {
      try {
        await connection.query("ROLLBACK");
      } catch (e) {
        console.error("Rollback error:", e);
      }
    }
    console.error("Delete user error:", error);
    res
      .status(500)
      .json({ success: false, error: ERROR_MESSAGES.FAILED_DELETE_USER });
  } finally {
    if (connection && connection.release) connection.release();
  }
};

module.exports = {
  deleteUser,
};
