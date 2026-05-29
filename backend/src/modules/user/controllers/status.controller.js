const { pool } = require("../../../config/database");
const { logAudit } = require("../../audit/audit.service");
const {
  createNotification,
  notifyAllAdmins,
} = require("../../notification/services/notification.service");
const { sendVerificationEmail } = require("../../../shared/services/email");

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user
 * @access  Private (Admin)
 */
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("UPDATE users SET is_active = true WHERE id = ?", [id]);

    // Get user info for notification and email
    const [userInfo] = await pool.query(
      "SELECT id, username, email, full_name, role FROM users WHERE id = ?",
      [id],
    );

    if (!userInfo || userInfo.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = userInfo[0];
    const userName = user.full_name || user.username || "User";

    // Log audit
    await logAudit(
      req.user.id,
      "ACTIVATE",
      "user",
      id,
      {
        action: "activate",
        is_active: true,
      },
      req,
    );

    // Send Verification/Welcome Email
    // Since we suppressed it on creation, we send it now.
    // Note: Password is not available here, so template will say "Use the password you set".
    try {
      await sendVerificationEmail(user);
      console.log(
        `📧 Verification email sent to ${user.email} upon activation`,
      );
    } catch (emailError) {
      console.error(
        "Failed to send verification email on activation:",
        emailError,
      );
    }

    // Notify the user about account activation
    try {
      await createNotification(
        id,
        "user_activity",
        "👤 Account Activated",
        "Your account has been activated. You can now log in and access the system.",
        {
          data: {
            activatedBy: req.user.id,
            status: "active",
          },
          priority: "medium",
          action_url: "/login",
          action_label: "Login",
        },
      );
      console.log(`📧 User ${userName} notified about account activation`);
    } catch (notifError) {
      console.error("Failed to send notification to user:", notifError);
    }

    // Notify all admins about account activation
    try {
      const activatedByName =
        req.user?.full_name || req.user?.username || "Administrator";

      await notifyAllAdmins(
        "user_activity",
        "✅ User Account Activated",
        `${activatedByName} activated ${userName}'s account`,
        {
          data: {
            userId: id,
            username: userInfo[0]?.username,
            fullName: userName,
            activatedBy: activatedByName,
          },
          priority: "low",
          action_url: `/admin/users/${id}`,
          action_label: "View User",
        },
      );
      console.log(`📧 Admins notified about account activation: ${userName}`);
    } catch (notifError) {
      console.error("Failed to notify admins about activation:", notifError);
    }

    res.json({ success: true, message: "User activated successfully" });
  } catch (error) {
    console.error("Activate user error:", error);
    res.status(500).json({ success: false, error: "Failed to activate user" });
  }
};

/**
 * @route   PATCH /api/users/:id/deactivate
 * @desc    Deactivate user
 * @access  Private (Admin)
 */
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deactivating self
    if (req.user.id === parseInt(id)) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot deactivate yourself" });
    }

    await pool.query("UPDATE users SET is_active = false WHERE id = ?", [id]);

    // Get user info for notification
    const [userInfo] = await pool.query(
      "SELECT username, full_name FROM users WHERE id = ?",
      [id],
    );
    const userName = userInfo[0]?.full_name || userInfo[0]?.username || "User";

    // Log audit
    await logAudit(
      req.user.id,
      "DEACTIVATE",
      "user",
      id,
      {
        action: "deactivate",
        is_active: false,
      },
      req,
    );

    // Notify the user about account deactivation
    try {
      await createNotification(
        id,
        "user_activity",
        "👤 Account Deactivated",
        "Your account has been deactivated. Please contact an administrator if you have questions.",
        {
          data: {
            deactivatedBy: req.user.id,
            status: "inactive",
          },
          priority: "medium",
          action_url: "/support",
          action_label: "Contact Support",
        },
      );
      console.log(`📧 User ${userName} notified about account deactivation`);
    } catch (notifError) {
      console.error("Failed to send notification to user:", notifError);
    }

    // Notify all admins about account deactivation
    try {
      const deactivatedByName =
        req.user?.full_name || req.user?.username || "Administrator";

      await notifyAllAdmins(
        "user_activity",
        "⛔ User Account Deactivated",
        `${deactivatedByName} deactivated ${userName}'s account`,
        {
          data: {
            userId: id,
            username: userInfo[0]?.username,
            fullName: userName,
            deactivatedBy: deactivatedByName,
          },
          priority: "medium",
          action_url: `/admin/users/${id}`,
          action_label: "View User",
        },
      );
      console.log(`📧 Admins notified about account deactivation: ${userName}`);
    } catch (notifError) {
      console.error("Failed to notify admins about deactivation:", notifError);
    }

    res.json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    console.error("Deactivate user error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to deactivate user" });
  }
};

module.exports = {
  activateUser,
  deactivateUser,
};
