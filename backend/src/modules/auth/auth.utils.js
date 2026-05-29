const crypto = require("crypto");

/**
 * Mask email address
 */
const maskEmail = (email) => {
  return email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
};

/**
 * Format user response
 */
const formatUserResponse = (user, regions = []) => {
  const assignedRegions = regions.map((r) => r.name || r);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.full_name,
    full_name: user.full_name,
    role: user.role,
    phone: user.phone,
    phoneNumber: user.phone,
    department: user.department,
    officeLocation: user.office_location,
    office_location: user.office_location,
    gender: user.gender,
    street: user.street,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
    address: {
      street: user.street,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
    },
    assignedRegions: assignedRegions,
    status: user.is_active ? "Active" : "Inactive",
    isActive: Boolean(user.is_active),
    isEmailVerified: Boolean(user.is_email_verified),
    is_email_verified: Boolean(user.is_email_verified),
    emailVerifiedAt: user.email_verified_at_utc
      ? new Date(user.email_verified_at_utc).toISOString()
      : null,
    email_verified_at: user.email_verified_at_utc
      ? new Date(user.email_verified_at_utc).toISOString()
      : null,
    manualVerification: Boolean(user.manual_verification),
    manual_verification: Boolean(user.manual_verification),
    emailVerifiedBy: user.email_verified_by,
    email_verified_by: user.email_verified_by,
    lastVerificationEmailSent: user.last_verification_email_sent,
    last_verification_email_sent: user.last_verification_email_sent,
    mfaEnabled: Boolean(user.mfa_enabled),
    mfa_enabled: Boolean(user.mfa_enabled),
    mfaMethod: user.mfa_method || "email",
    mfa_method: user.mfa_method || "email",
    mfaEnabledAt: user.mfa_enabled_at_utc
      ? new Date(user.mfa_enabled_at_utc).toISOString()
      : null,
    mfa_enabled_at: user.mfa_enabled_at_utc
      ? new Date(user.mfa_enabled_at_utc).toISOString()
      : null,
    createdBy: user.created_by,
    createdByName: user.created_by_name,
    createdAt: user.created_at_utc
      ? new Date(user.created_at_utc).toISOString()
      : null,
    updatedAt: user.updated_at_utc
      ? new Date(user.updated_at_utc).toISOString()
      : null,
    lastLogin: user.last_login_utc
      ? new Date(user.last_login_utc).toISOString()
      : null,
    last_login: user.last_login_utc
      ? new Date(user.last_login_utc).toISOString()
      : null,
    lastLogin: user.last_login_utc
      ? new Date(user.last_login_utc).toISOString()
      : null,
    last_login: user.last_login_utc
      ? new Date(user.last_login_utc).toISOString()
      : null,
    regions: regions,
    // Add permissions (prioritize effective merged permissions)
    permissions: user.effectivePermissions || user.permissions || [],
    directPermissions: user.permissions || [],
    map_preferences: user.map_preferences || {},
  };
};

const createSessionTokenHash = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  maskEmail,
  formatUserResponse,
  createSessionTokenHash,
};
