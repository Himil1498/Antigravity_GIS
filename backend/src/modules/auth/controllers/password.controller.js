const { pool } = require("../../../config/database");
const { logAudit } = require("../../audit/audit.service");
const {
  notifyAllAdmins,
  createNotification,
} = require("../../notification/services/notification.service");
const {
  sendAdminPasswordResetEmail,
} = require("../../../shared/services/email");
const { hashPassword } = require("../../../shared/utils/bcrypt");
const authService = require("../auth.service");
const crypto = require("crypto");

// --- Constants ---
const ERRORS = {
  USERNAME_REQUIRED: "Username is required",
  USER_NOT_FOUND: "User not found",
  SUBMIT_FAILED: "Failed to submit request",
  FETCH_FAILED: "Failed to fetch requests",
  REQUEST_NOT_FOUND: "Request not found",
  PASSWORD_LENGTH: "Password must be at least 6 characters",
  REQUEST_USED: "Request already used",
  REQUEST_EXPIRED: "Request expired",
  NO_USER_ID: "Request has no associated user",
  APPROVE_FAILED: "Failed to approve request",
  REJECT_FAILED: "Failed to reject request",
  DELETE_FAILED: "Failed to delete request",
  PASSWORD_REQUIRED: "Old and new passwords are required",
  INVALID_OLD_PASSWORD: "Invalid old password",
  SAME_PASSWORD: "New password cannot be the same as old password",
  CHANGE_FAILED: "Failed to change password",
};

const SUCCESS = {
  SUBMITTED: "Password reset request submitted successfully",
  APPROVED: "Request approved and password updated",
  REJECTED: "Request rejected",
  DELETED: "Request deleted",
  CHANGED: "Password changed successfully",
};

// --- Password Reset Request (Public) ---

const submitPasswordResetRequest = async (req, res) => {
  try {
    const { username, reason } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!username || username.trim() === "") {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.USERNAME_REQUIRED });
    }

    const [users] = await pool.query(
      `SELECT id, username, email, full_name
       FROM users
       WHERE username = ? OR email = ? OR CAST(id AS TEXT) = ?
       LIMIT 1`,
      [username, username, username],
    );

    if (users.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.USER_NOT_FOUND });
    }

    const userId = users[0].id;
    const userFullName = users[0].full_name;
    const token = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `INSERT INTO passwords_reset_requests
       (user_id, token, created_at, expires_at)
       VALUES (?, ?, NOW(), NOW() + INTERVAL '24 hours')`,
      [userId, token],
    );

    await notifyAllAdmins(
      "password_reset_request",
      "🔐 Password Reset Request",
      `User ${userFullName} (${username}) requested a password reset. Reason: ${reason || "Not provided"}`,
      {
        data: { username, userId, ipAddress },
        priority: "high",
        action_url: "/admin/password-reset-requests",
        action_label: "View Request",
      },
    );

    res.json({ success: true, message: SUCCESS.SUBMITTED });
  } catch (error) {
    console.error("Submit password reset request error:", error);
    res.status(500).json({ success: false, error: ERRORS.SUBMIT_FAILED });
  }
};

// --- Password Reset Request (Admin) ---

const getAllPasswordResetRequests = async (req, res) => {
  try {
    const { status = "all" } = req.query;

    let innerQuery = `
      SELECT
        prr.id, prr.user_id, prr.token, prr.created_at as requested_at,
        prr.expires_at, prr.used_at,
        CASE
          WHEN prr.used_at IS NOT NULL THEN 'completed'
          WHEN prr.used_at IS NULL AND prr.expires_at <= NOW() THEN 'expired'
          ELSE 'pending'
        END as status,
        u.username, u.email, u.full_name
      FROM passwords_reset_requests prr
      LEFT JOIN users u ON prr.user_id = u.id
    `;

    let query = `SELECT * FROM (${innerQuery}) AS requests`;
    const params = [];

    if (status === "used" || status === "completed") {
      query += " WHERE status = ?";
      params.push("completed");
    } else if (status === "pending") {
      query += " WHERE status = ?";
      params.push("pending");
    } else if (status === "expired" || status === "rejected") {
      query += " WHERE status = ?";
      params.push("expired");
    }

    query += " ORDER BY requested_at DESC LIMIT 100";

    const [requests] = await pool.query(query, params);

    res.json({ success: true, requests });
  } catch (error) {
    console.error("Get password reset requests error:", error);
    res.status(500).json({ success: false, error: ERRORS.FETCH_FAILED });
  }
};

const getPasswordResetRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await pool.query(
      `SELECT
        prr.id, prr.user_id, prr.token, prr.created_at, prr.expires_at, prr.used_at,
        u.username, u.email, u.full_name
      FROM passwords_reset_requests prr
      LEFT JOIN users u ON prr.user_id = u.id
      WHERE prr.id = ?`,
      [id],
    );

    if (requests.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.REQUEST_NOT_FOUND });
    }

    res.json({ success: true, request: requests[0] });
  } catch (error) {
    console.error("Get password reset request by ID error:", error);
    res.status(500).json({ success: false, error: ERRORS.FETCH_FAILED });
  }
};

const approvePasswordResetRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.PASSWORD_LENGTH });
    }

    const [requests] = await pool.query(
      `SELECT prr.*, u.username, u.email, u.full_name
       FROM passwords_reset_requests prr
       LEFT JOIN users u ON prr.user_id = u.id
       WHERE prr.id = ?`,
      [id],
    );

    if (requests.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.REQUEST_NOT_FOUND });
    }

    const request = requests[0];

    if (request.used_at) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.REQUEST_USED });
    }

    if (new Date(request.expires_at) < new Date()) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.REQUEST_EXPIRED });
    }

    if (!request.user_id) {
      return res.status(400).json({ success: false, error: ERRORS.NO_USER_ID });
    }

    const hashedPassword = await hashPassword(newPassword);

    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      hashedPassword,
      request.user_id,
    ]);

    await pool.query(
      "UPDATE passwords_reset_requests SET used_at = NOW() WHERE id = ?",
      [id],
    );

    try {
      await logAudit(
        req.user.id,
        "Approved password reset request",
        "USER_UPDATE",
        request.user_id,
        {
          action: "RESET_PASSWORD_APPROVE",
          requestId: id,
          targetUser: request.username,
        },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    if (request.email) {
      try {
        await sendAdminPasswordResetEmail(
          {
            email: request.email,
            username: request.username,
            full_name: request.full_name || request.username,
          },
          newPassword,
        );
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
      }
    }

    await createNotification(
      request.user_id,
      "password_reset_approved",
      "Password Reset Approved",
      "Your password reset request has been approved and password updated.",
      { priority: "high" },
    );

    res.json({ success: true, message: SUCCESS.APPROVED });
  } catch (error) {
    console.error("Approve password reset request error:", error);
    res.status(500).json({ success: false, error: ERRORS.APPROVE_FAILED });
  }
};

const rejectPasswordResetRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await pool.query(
      "SELECT * FROM passwords_reset_requests WHERE id = ?",
      [id],
    );

    if (requests.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.REQUEST_NOT_FOUND });
    }

    const request = requests[0];

    if (request.user_id) {
      await createNotification(
        request.user_id,
        "password_reset_rejected",
        "Password Reset Rejected",
        "Your password reset request was rejected by admin.",
        { priority: "high" },
      );
    }

    await pool.query("DELETE FROM passwords_reset_requests WHERE id = ?", [id]);

    try {
      await logAudit(
        req.user.id,
        "Rejected password reset request",
        "USER_UPDATE",
        request.user_id,
        {
          action: "RESET_PASSWORD_REJECT",
          requestId: id,
          targetUser: request.username,
        },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.json({ success: true, message: SUCCESS.REJECTED });
  } catch (error) {
    console.error("Reject password reset request error:", error);
    res.status(500).json({ success: false, error: ERRORS.REJECT_FAILED });
  }
};

const deletePasswordResetRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM passwords_reset_requests WHERE id = ?", [id]);
    res.json({ success: true, message: SUCCESS.DELETED });
  } catch (error) {
    console.error("Delete password reset request error:", error);
    res.status(500).json({ success: false, error: ERRORS.DELETE_FAILED });
  }
};

const deleteAllPasswordResetRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = "DELETE FROM passwords_reset_requests";
    const params = [];

    if (status && status !== "all") {
      // logic to match getAll requests maps specific statuses
      if (status === "completed") {
        query += " WHERE used_at IS NOT NULL";
      } else if (status === "pending") {
        query += " WHERE used_at IS NULL AND expires_at > NOW()";
      } else if (status === "rejected") {
        // 'rejected' status isn't explicitly stored in DB usually unless soft delete or status column exists.
        // Looking at getAll, 'rejected' maps to 'expired' or isn't there?
        // Wait, getAll has: WHEN prr.used_at IS NULL AND prr.expires_at <= NOW() THEN 'expired'
        // The reject controller deletes the request! So "rejected" requests are gone.
        // So we can only delete 'pending', 'completed' (used), or 'expired'.
        // If the user filter says 'rejected', it shows nothing?
        // RequestFilters shows: pending, completed, rejected.
        // Let's look at getAll logic again.
        // "ELSE 'pending'"
        // Reject controller: DELETE FROM passwords_reset_requests WHERE id = ?
        // So Rejected requests don't exist. The filter 'rejected' likely yields 0 results if they are deleted.
        // So for Delete All, we mainly care about: All, Pending, Completed, Expired.
        // If user selects 'rejected' tab, list is empty, Delete All should probably do nothing or be disabled.
        // Just handling 'passed status' safely.
        if (status === "expired") {
          query += " WHERE used_at IS NULL AND expires_at <= NOW()";
        }
      }
    }

    await pool.query(query, params);

    try {
      await logAudit(
        req.user.id,
        `Deleted all ${status || "all"} password reset requests`,
        "USER_UPDATE",
        null,
        { action: "DELETE_ALL_PASSWORD_RESETS", statusFilter: status },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.json({ success: true, message: "All requests deleted successfully" });
  } catch (error) {
    console.error("Delete all password reset requests error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete requests" });
  }
};

// --- Change Password (Authenticated User) ---

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.PASSWORD_REQUIRED });
    }

    const user = await authService.getUserById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: ERRORS.USER_NOT_FOUND });

    const isMatch = await authService.validatePassword(
      oldPassword,
      user.password_hash,
    );
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.INVALID_OLD_PASSWORD });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.SAME_PASSWORD });
    }

    await authService.updatePassword(userId, newPassword);

    try {
      await logAudit(
        userId,
        "Changed password",
        "USER_UPDATE",
        userId,
        { action: "CHANGE_PASSWORD" },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.json({ success: true, message: SUCCESS.CHANGED });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, error: ERRORS.CHANGE_FAILED });
  }
};

module.exports = {
  // Public
  submitPasswordResetRequest,

  // Admin
  getAllPasswordResetRequests,
  getPasswordResetRequestById,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
  deletePasswordResetRequest,
  deleteAllPasswordResetRequests,

  // Authenticated User
  changePassword,
};
