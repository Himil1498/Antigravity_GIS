const authService = require("../auth.service");
const mfaService = require("../mfa.service");
const auditService = require("../../audit/audit.service");
const { maskEmail, formatUserResponse } = require("../auth.utils");
const {
  generateToken,
  generateRefreshToken,
} = require("../../../shared/utils/jwt");
const asyncHandler = require("../../../shared/utils/asyncHandler");
const AppError = require("../../../shared/utils/AppError");

const ERRORS = {
  INVALID_CREDENTIALS: "Invalid credentials",
  ACCOUNT_DEACTIVATED: "Account is deactivated. Please contact administrator.",
  EMAIL_NOT_VERIFIED:
    "Please verify your email address before logging in. Check your email for the verification link.",
  INVALID_PASSWORD: "Invalid email or password",
};

const login = asyncHandler(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  // Find user
  const user = await authService.findUserByIdentifier(email);

  if (!user) {
    // Audit Log: Failure (Unknown User)
    await auditService.logAudit(
      0, // Unknown user
      "LOGIN",
      "USER",
      0,
      {
        action: "LOGIN_FAILURE",
        email: email,
        reason: "User not found",
      },
      req,
    );
    throw new AppError(ERRORS.INVALID_CREDENTIALS, 401);
  }

  if (!user.is_active) {
    await auditService.logAudit(
      user.id,
      "LOGIN",
      "USER",
      user.id,
      {
        action: "LOGIN_FAILURE",
        reason: "Account deactivated",
      },
      req,
    );
    throw new AppError(ERRORS.ACCOUNT_DEACTIVATED, 401);
  }

  if (!user.is_email_verified) {
    await auditService.logAudit(
      user.id,
      "LOGIN",
      "USER",
      user.id,
      {
        action: "LOGIN_FAILURE",
        reason: "Email not verified",
      },
      req,
    );
    // Custom payload for email verification
    return res.status(401).json({
      success: false,
      error: ERRORS.EMAIL_NOT_VERIFIED,
      emailNotVerified: true,
      email: user.email,
    });
  }

  // Validate password
  const isPasswordValid = await authService.validatePassword(
    password,
    user.password_hash,
  );

  if (!isPasswordValid) {
    await auditService.logAudit(
      user.id,
      "LOGIN",
      "USER",
      user.id,
      {
        action: "LOGIN_FAILURE",
        reason: "Invalid password",
      },
      req,
    );
    throw new AppError(ERRORS.INVALID_PASSWORD, 401);
  }

  // Handle 2FA
  if (user.mfa_enabled) {
    const twoFactorResponse = await mfaService.handle2FAFlow(user, req);
    return res.json({
      success: true,
      require2FA: true,
      userId: twoFactorResponse.userId,
      email: maskEmail(user.email),
      message: "Verification code sent to your email",
      expiresIn: twoFactorResponse.expiresIn,
    });
  }

  // Update login status
  await authService.updateUserLoginStatus(user.id);

  // Get regions
  const regions = await authService.getUserRegions(user.id);

  // Generate tokens (7-day expiry when "Keep me signed in" is checked)
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  }, { rememberMe: !!rememberMe });
  const refreshToken = generateRefreshToken({ id: user.id });

  // Create session
  await authService.createUserSession(user.id, token, req);

  // Fetch Role Permissions and Merge for Initial State
  const rolePermissions = await authService.getRolePermissions(user.role);
  const directPermissions = user.permissions || [];
  
  const allPerms = new Set([...directPermissions, ...rolePermissions]);
  
  // Auto-grant view permissions based on presence of sub-permissions to prevent lockouts
  const prefixes = ["network", "map", "datahub", "dashboard", "users", "groups", "admin", "analytics"];
  
  prefixes.forEach(prefix => {
      const hasSubPerm = Array.from(allPerms).some(p => p.startsWith(`${prefix}:`) && p !== `${prefix}:view`);
      if (hasSubPerm) {
          allPerms.add(`${prefix}:view`);
      }
  });

  user.effectivePermissions = [...allPerms];

  // Format response
  const formattedUser = formatUserResponse(user, regions);

  // Audit Log: Success
  await auditService.logAudit(
    user.id,
    "LOGIN",
    "USER",
    user.id,
    {
      action: "LOGIN_SUCCESS",
      email: user.email,
    },
    req,
  );

  res.json({
    success: true,
    token,
    refreshToken,
    user: formattedUser,
  });
});

const verifyPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const userId = req.user.id;

  if (!password) {
    throw new AppError("Password is required", 400);
  }

  // Get user with password hash (middleware usually attaches user but maybe not hash)
  // We need to fetch the user again to be sure we have the hash
  const user = await authService.getUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Validate password
  const isPasswordValid = await authService.validatePassword(
    password,
    user.password_hash
  );

  if (!isPasswordValid) {
    // Optional: Log failed verification attempt
     await auditService.logAudit(
      user.id,
      "SECURITY",
      "USER",
      user.id,
      {
        action: "PASSWORD_VERIFICATION_FAILURE",
        reason: "Invalid password during sensitive action confirmation"
      },
      req
    );
    
    throw new AppError(ERRORS.INVALID_PASSWORD, 401);
  }

  // Success - No login log created
  res.json({ success: true, message: "Password verified" });
});

module.exports = { login, verifyPassword };
