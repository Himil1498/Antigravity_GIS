const { pool } = require("../../../config/database");
const mfaService = require("../mfa.service");
const { logAudit } = require("../../audit/audit.service");
const authService = require("../auth.service");
const { maskEmail, formatUserResponse } = require("../auth.utils");
const {
  generateToken,
  generateRefreshToken,
} = require("../../../shared/utils/jwt");
const crypto = require("crypto");

const ERRORS = {
  PASSWORD_REQUIRED: "Password is required",
  USER_NOT_FOUND: "User not found",
  ALREADY_ENABLED: "2FA is already enabled",
  INVALID_PASSWORD: "Invalid password",
  SEND_CODE_FAILED: "Failed to send verification code",
  INVALID_CODE_FORMAT: "Invalid code format",
  INVALID_OR_EXPIRED: "Invalid or expired code",
  TOO_MANY_ATTEMPTS: "Too many failed attempts. Please try again later.",
  ENABLE_FAILED: "Failed to enable 2FA",
  NOT_ENABLED: "2FA is not enabled",
  DISABLE_FAILED: "Failed to disable 2FA",
  USER_ID_REQUIRED: "User ID is required",
  NOT_ENABLED_USER: "2FA is not enabled for this user",
  CODE_SENT: "Verification code sent",
  CODE_REQUIRED: "Code is required",
  VERIFY_FAILED: "Verification failed",
};

const SUCCESS = {
  TEST_CODE_SENT: "Test code sent. Please verify to enable 2FA.",
  ENABLED: "2FA enabled successfully",
  DISABLED: "2FA disabled successfully",
  CODE_SENT: "Verification code sent",
  VERIFIED: "2FA verified successfully",
};

// --- Configuration ---

const enable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.PASSWORD_REQUIRED });
    }

    const user = await authService.getUserById(userId); // Need password hash query or custom
    // getUserById in auth.service returns with password hash if built that way.
    // Let's check auth.service. Yes, buildUserQuery(true) includes password_hash.

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.USER_NOT_FOUND });
    }

    if (user.mfa_enabled) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.ALREADY_ENABLED });
    }

    const isPasswordValid = await authService.validatePassword(
      password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: ERRORS.INVALID_PASSWORD });
    }

    // Reuse mfaService to generate and send code logic?
    // mfaService.handle2FAFlow is for LOGIN (sends code, returns require2FA).
    // We need logic to just send a test code for enabling.
    // I will implement it here or add to mfa.service. Adding to service is better.
    // For fast refactor, I will implement here using mfaService helper if available, or just copy logic.
    // mfaService exports generate2FACode (no, utils does, mfaService uses it).
    // mfaService.js I wrote has generate2FACode exported.

    // Actually, let's create a helper in mfa.service for "sendCode" generic use maybe?
    // For now, inline logic using imports.
    const code = mfaService.generate2FACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `INSERT INTO mfa_tokens (user_id, token, expires_at, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, code, expiresAt, req.ip, req.headers["user-agent"]],
    );

    const { send2FACode } = require("../../../shared/services/email");
    await send2FACode(user.email, user.full_name, code);

    res.json({
      success: true,
      message: SUCCESS.TEST_CODE_SENT,
      email: user.email,
      requireVerification: true,
    });
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    res.status(500).json({ success: false, error: ERRORS.ENABLE_FAILED });
  }
};

const verifyAndEnable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code || code.length !== 6) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.INVALID_CODE_FORMAT });
    }

    const [tokens] = await pool.query(
      `SELECT * FROM mfa_tokens
       WHERE user_id = ? AND token = ? AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [userId, code],
    );

    if (tokens.length === 0) {
      await pool.query(
        `UPDATE mfa_tokens SET attempts = attempts + 1
         WHERE user_id = ? AND token = ? AND is_used = FALSE`,
        [userId, code],
      );
      return res
        .status(401)
        .json({ success: false, error: ERRORS.INVALID_OR_EXPIRED });
    }

    const token = tokens[0];
    if (token.attempts >= 5) {
      return res
        .status(429)
        .json({ success: false, error: ERRORS.TOO_MANY_ATTEMPTS });
    }

    await pool.query(
      "UPDATE mfa_tokens SET is_used = TRUE, used_at = NOW() WHERE id = ?",
      [token.id],
    );
    await pool.query(
      `UPDATE users SET mfa_enabled = 1, mfa_method = 'email', mfa_enabled_at = NOW() WHERE id = ?`,
      [userId],
    );

    // Audit
    await logAudit(
      userId,
      "2FA_ENABLED",
      "user",
      userId,
      { method: "email" },
      req,
    );

    res.json({ success: true, message: SUCCESS.ENABLED });
  } catch (error) {
    console.error("Error verifying and enabling 2FA:", error);
    res.status(500).json({ success: false, error: ERRORS.ENABLE_FAILED });
  }
};

const disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.PASSWORD_REQUIRED });
    }

    const user = await authService.getUserById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: ERRORS.USER_NOT_FOUND });

    if (!user.mfa_enabled) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.NOT_ENABLED });
    }

    const isPasswordValid = await authService.validatePassword(
      password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: ERRORS.INVALID_PASSWORD });
    }

    await pool.query(
      `UPDATE users SET mfa_enabled = 0, mfa_method = 'email', mfa_enabled_at = NULL WHERE id = ?`,
      [userId],
    );
    // Invalidate tokens
    await pool.query(
      "DELETE FROM mfa_tokens WHERE user_id = ? AND is_used = FALSE",
      [userId],
    );

    await logAudit(
      userId,
      "2FA_DISABLED",
      "user",
      userId,
      { method: "email" },
      req,
    );

    res.json({ success: true, message: SUCCESS.DISABLED });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    res.status(500).json({ success: false, error: ERRORS.DISABLE_FAILED });
  }
};

const get2FAStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await authService.getUserById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: ERRORS.USER_NOT_FOUND });

    res.json({
      success: true,
      mfa: {
        enabled: Boolean(user.mfa_enabled),
        method: user.mfa_method || "email",
        enabledAt: user.mfa_enabled_at,
      },
    });
  } catch (error) {
    console.error("Error getting 2FA status:", error);
    res.status(500).json({ success: false, error: "Failed to get 2FA status" });
  }
};

// --- Login Flow ---

const send2FACodeForLogin = async (req, res) => {
  // Reuse mfaService handle logic? Or existing controller logic?
  // Existing logic in loginController.js (auth/mfa/loginController.js) handles "send2FACodeForLogin"
  // It verifies user exists and has MFA enabled, then sends code.
  try {
    const { userId } = req.body;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, error: ERRORS.USER_ID_REQUIRED });

    const [users] = await pool.query(
      "SELECT id, email, full_name, mfa_enabled FROM users WHERE id = ?",
      [userId],
    );
    if (users.length === 0)
      return res
        .status(404)
        .json({ success: false, error: ERRORS.USER_NOT_FOUND });
    const user = users[0];

    if (!user.mfa_enabled)
      return res
        .status(400)
        .json({ success: false, error: ERRORS.NOT_ENABLED_USER });

    // Logic similar to mfaService.handle2FAFlow but slightly different returns?
    // Let's use mfaService.handle2FAFlow to generate and send, then return custom response if needed.
    // Actually handle2FAFlow sends email and inserts token.
    // It returns { require2FA: true, userId... }

    await mfaService.handle2FAFlow(user, req);

    res.json({
      success: true,
      message: SUCCESS.CODE_SENT,
      email: maskEmail(user.email),
      expiresIn: 600,
    });
  } catch (error) {
    console.error("Error sending 2FA code:", error);
    res.status(500).json({ success: false, error: ERRORS.SEND_CODE_FAILED });
  }
};

const verify2FACode = async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code)
      return res
        .status(400)
        .json({ success: false, error: ERRORS.CODE_REQUIRED });

    // Verify logic
    const [tokens] = await pool.query(
      `SELECT * FROM mfa_tokens
             WHERE user_id = ? AND token = ? AND is_used = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1`,
      [userId, code],
    );

    if (tokens.length === 0) {
      // log failure
      return res
        .status(401)
        .json({ success: false, error: ERRORS.INVALID_OR_EXPIRED });
    }

    const token = tokens[0];
    if (token.attempts >= 5)
      return res
        .status(429)
        .json({ success: false, error: ERRORS.TOO_MANY_ATTEMPTS });

    await pool.query(
      "UPDATE mfa_tokens SET is_used = TRUE, used_at = NOW() WHERE id = ?",
      [token.id],
    );

    // Login success flow
    const user = await authService.getUserById(userId);
    await authService.updateUserLoginStatus(userId);
    const regions = await authService.getUserRegions(userId);

    const authToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ id: user.id });
    await authService.createUserSession(userId, authToken, req);

    const formattedUser = formatUserResponse(user, regions);

    res.json({
      success: true,
      message: SUCCESS.VERIFIED,
      verified: true,
      token: authToken,
      refreshToken,
      user: formattedUser,
    });
  } catch (error) {
    console.error("Error verifying 2FA code:", error);
    res.status(500).json({ success: false, error: ERRORS.VERIFY_FAILED });
  }
};

// --- Admin ---
const adminForce2FA = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminUser = req.user;

    if (adminUser.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, error: "Admin access required" });
    }

    const [users] = await pool.query(
      "SELECT id, username, email FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.USER_NOT_FOUND });
    }

    const targetUser = users[0];

    await pool.query(
      `UPDATE users SET
        mfa_enabled = 1,
        mfa_method = 'email',
        mfa_enabled_at = NOW(),
        updated_at = NOW()
      WHERE id = ?`,
      [userId],
    );

    const [updatedUsers] = await pool.query(
      "SELECT id, username, email, mfa_enabled, mfa_method, mfa_enabled_at FROM users WHERE id = ?",
      [userId],
    );

    await logAudit(
      adminUser.id,
      "ADMIN_FORCE_2FA",
      "user",
      userId,
      {
        target_user: targetUser.username,
        action: "Admin enabled 2FA",
      },
      req,
    );

    // Format user response
    const formattedUser = formatUserResponse(updatedUsers[0]);

    res.json({
      success: true,
      message: `2FA forced enabled for ${targetUser.username}`,
      user: formattedUser,
    });
  } catch (error) {
    console.error("Error forcing 2FA:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to force enable 2FA" });
  }
};

const adminDisable2FA = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminUser = req.user;

    if (adminUser.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, error: "Admin access required" });
    }

    const [users] = await pool.query(
      "SELECT id, username, email, mfa_enabled FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.USER_NOT_FOUND });
    }

    const targetUser = users[0];

    if (!targetUser.mfa_enabled) {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.NOT_ENABLED_USER });
    }

    await pool.query(
      `UPDATE users SET
        mfa_enabled = 0,
        mfa_method = 'email',
        mfa_enabled_at = NULL,
        updated_at = NOW()
      WHERE id = ?`,
      [userId],
    );

    await pool.query("DELETE FROM mfa_tokens WHERE user_id = ?", [userId]);

    const [updatedUsers] = await pool.query(
      "SELECT id, username, email, mfa_enabled, mfa_method, mfa_enabled_at FROM users WHERE id = ?",
      [userId],
    );

    await logAudit(
      adminUser.id,
      "ADMIN_DISABLE_2FA",
      "user",
      userId,
      {
        target_user: targetUser.username,
        reason: "Admin disabled 2FA",
      },
      req,
    );

    // Format user response
    const formattedUser = formatUserResponse(updatedUsers[0]);

    res.json({
      success: true,
      message: `2FA disabled for ${targetUser.username}`,
      user: formattedUser,
    });
  } catch (error) {
    console.error("Error disabling user 2FA:", error);
    res.status(500).json({ success: false, error: "Failed to disable 2FA" });
  }
};

module.exports = {
  enable2FA,
  verifyAndEnable2FA,
  disable2FA,
  get2FAStatus,
  send2FACodeForLogin,
  verify2FACode,
  adminForce2FA,
  adminDisable2FA,
};
