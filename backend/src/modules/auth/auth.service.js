const { pool, prisma } = require("../../config/database");
const { hashPassword, comparePassword } = require("../../shared/utils/bcrypt");
const { sendVerificationEmail } = require("../../shared/services/email");
const {
  notifyAllAdmins,
} = require("../notification/services/notification.service");
const crypto = require("crypto");
const {
  DEFAULT_ROLE_PERMISSIONS,
} = require("../access-control/constants/rolePermissions");

// We no longer need buildUserQuery as Prisma returns all mapped fields by default.
// If specific fields are needed, we use Prisma's `select`.

const isNumeric = (str) => {
  return /^\d+$/.test(str);
};

// --- User Service Logic ---

const findUserByIdentifier = async (identifier) => {
  if (isNumeric(identifier)) {
    return await prisma.users.findFirst({
      where: {
        OR: [
          { id: parseInt(identifier, 10) },
          { username: identifier },
          { email: identifier },
        ],
      },
    });
  } else {
    return await prisma.users.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });
  }
};

const getUserById = async (userId) => {
  return await prisma.users.findUnique({
    where: { id: parseInt(userId, 10) },
  });
};

const getUserRegions = async (userId) => {
  // Using $queryRaw due to missing foreign key relation metadata
  const regions = await prisma.$queryRaw`
    SELECT r.id, r.name, r.code, r.type, ur.access_level
    FROM regions r
    INNER JOIN user_regions ur ON r.id = ur.region_id
    WHERE ur.user_id = ${parseInt(userId, 10)} AND r.is_active = true
  `;
  return regions;
};

const registerUser = async (userData) => {
  const { username, email, password, full_name, role = "user" } = userData;

  // Check if user already exists
  const existingUser = await prisma.users.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw new Error("User with this email or username already exists");
  }

  const password_hash = await hashPassword(password);
  const effectiveRole = role || "user";
  const defaultPermissions = [];

  const newUser = await prisma.users.create({
    data: {
      username,
      email,
      password_hash,
      full_name,
      role: effectiveRole,
      is_active: true,
      permissions: defaultPermissions,
    },
  });

  const userId = newUser.id;

  // Send verification email
  try {
    await sendVerificationEmail({
      id: userId,
      email,
      username,
      full_name,
      role,
      password, // Note: Sending plain password in email is not best practice, but maintaining existing behavior
    });
    console.log(`✅ Verification email sent to ${email}`);
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
  }

  // Notify admins
  try {
    await notifyAllAdmins(
      "user_activity",
      "👤 New User Registered",
      `${full_name} (${username}) has registered with email ${email}`,
      {
        data: {
          userId,
          username,
          email,
          fullName: full_name,
          role,
          emailVerified: false,
        },
        priority: "low",
        action_url: `/admin/users/${userId}`,
        action_label: "View User",
      },
    );
  } catch (notifError) {
    console.error("Failed to send notification to admins:", notifError);
  }

  return {
    id: userId,
    username,
    email,
    full_name,
    role,
    is_email_verified: false,
  };
};

const updatePassword = async (userId, newPassword) => {
  const newPasswordHash = await hashPassword(newPassword);
  await prisma.users.update({
    where: { id: parseInt(userId, 10) },
    data: {
      password_hash: newPasswordHash,
      updated_at: new Date(),
    },
  });
};

const updateUserLoginStatus = async (userId) => {
  await prisma.users.update({
    where: { id: parseInt(userId, 10) },
    data: {
      last_login: new Date(),
      is_online: true,
    },
  });
};

const updateUserLogoutStatus = async (userId) => {
  await prisma.users.update({
    where: { id: parseInt(userId, 10) },
    data: {
      is_online: false,
    },
  });
};

// --- Password Service Logic ---

const validatePassword = async (password, passwordHash) => {
  return await comparePassword(password, passwordHash);
};

// --- Session Service Logic ---

const createSessionTokenHash = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const createUserSession = async (
  userId,
  token,
  req,
  refreshTokenExpiryDays = 1,
) => {
  try {
    const sessionToken = createSessionTokenHash(token);
    const deviceInfo = req.get("User-Agent") || "Unknown Device";
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Garbage Collection & De-duplication using raw query since it requires complex conditions
    await prisma.$queryRaw`DELETE FROM user_sessions WHERE user_id = ${parseInt(userId, 10)} AND expires_at < NOW()`;
    await prisma.$queryRaw`DELETE FROM user_sessions WHERE user_id = ${parseInt(userId, 10)} AND ip_address = ${ipAddress} AND user_agent = ${deviceInfo}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiryDays);

    await prisma.user_sessions.create({
      data: {
        session_token: sessionToken,
        user_id: parseInt(userId, 10),
        token,
        ip_address: ipAddress,
        user_agent: deviceInfo,
        expires_at: expiresAt,
      },
    });
  } catch (error) {
    console.error("Failed to create session record:", error);
  }
};

const invalidateSession = async (sessionToken, userId) => {
  // Prisma updates based on a unique id typically, but since we update by sessionToken AND userId, we can use updateMany
  await prisma.user_sessions.updateMany({
    where: {
      session_token: sessionToken,
      user_id: parseInt(userId, 10),
    },
    data: {
      expires_at: new Date(),
      logout_time: new Date(),
      logout_type: "user",
    },
  });
};

const getActiveSessions = async (userId) => {
  return await prisma.user_sessions.findMany({
    where: {
      user_id: parseInt(userId, 10),
      expires_at: { gt: new Date() },
    },
    select: {
      id: true,
      ip_address: true,
      user_agent: true,
      created_at: true,
      last_activity: true,
      expires_at: true,
    },
    orderBy: {
      last_activity: "desc",
    },
  });
};

const getRolePermissions = async (roleName) => {
  if (!roleName) return [];
  try {
    const role = await prisma.roles.findFirst({
      where: {
        name: { equals: roleName, mode: "insensitive" },
      },
    });

    if (role) {
      let perms = role.permissions;
      if (typeof perms === "string") {
        try {
          perms = JSON.parse(perms);
        } catch (e) {
          console.warn(`Failed to parse permissions for role ${roleName}:`, e);
        }
      }
      if (Array.isArray(perms)) return perms;
    }
  } catch (error) {
    console.warn(`Error fetching permissions for role ${roleName}:`, error);
  }
  return [];
};

module.exports = {
  findUserByIdentifier,
  getUserById,
  getUserRegions,
  registerUser,
  updatePassword,
  updateUserLoginStatus,
  updateUserLogoutStatus,
  validatePassword,
  createUserSession,
  invalidateSession,
  getActiveSessions,
  getRolePermissions,
};
