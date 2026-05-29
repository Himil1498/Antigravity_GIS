const { pool } = require("../../config/database");
const { send2FACode } = require("../../shared/services/email");
const crypto = require("crypto");

// --- Constants (Inline for now or import shared) ---
const MFA_CONSTANTS = {
  CODE_EXPIRY_MINUTES: 10,
  CODE_LENGTH: 6,
};

// --- Utils ---
const generate2FACode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Handle 2FA flow for login
 * @param {Object} user - User object
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Response object with 2FA details
 */
const handle2FAFlow = async (user, req) => {
  // Invalidate any previous unused codes
  await pool.query(
    "UPDATE mfa_tokens SET is_used = TRUE WHERE user_id = ? AND is_used = FALSE",
    [user.id],
  );

  // Generate new 2FA code
  const code = generate2FACode();
  const expiresAt = new Date(
    Date.now() + MFA_CONSTANTS.CODE_EXPIRY_MINUTES * 60 * 1000,
  );

  // Store code in database
  await pool.query(
    `INSERT INTO mfa_tokens (user_id, token, expires_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [user.id, code, expiresAt, req.ip, req.headers["user-agent"]],
  );

  // Send code via email
  await send2FACode(user.email, user.full_name, code);

  // Log audit event
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address)
     VALUES (?, '2FA_CODE_SENT', 'user', ?, ?)`,
    [user.id, user.id, req.ip],
  );

  return {
    require2FA: true,
    userId: user.id,
    expiresIn: MFA_CONSTANTS.CODE_EXPIRY_MINUTES * 60,
  };
};

module.exports = {
  handle2FAFlow,
  generate2FACode,
};
