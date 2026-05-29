const { pool, prisma } = require("../../config/database");
const { hashPassword } = require("../../shared/utils/bcrypt");
const { sendVerificationEmail } = require("../../shared/services/email");
const {
  notifyAllAdmins,
} = require("../notification/services/notification.service");
const { getDefaultFolderIdsForRole } = require("../access-control/services/role.service");
/**
 * Service to handle User Audit logic is kept in controller for now as it relies on req details.
 * Focus here is purely on Data Access and Core Business Logic.
 */

const findUserByEmailOrUsername = async (email, username) => {
  return await prisma.users.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });
};

const findUserById = async (userId) => {
  return await prisma.users.findUnique({
    where: { id: parseInt(userId, 10) },
    select: {
      id: true,
      username: true,
      email: true,
      full_name: true,
      role: true,
      phone: true,
      department: true,
      office_location: true,
      street: true,
      city: true,
      state: true,
      pincode: true,
      gender: true,
      is_active: true,
      permissions: true,
      map_preferences: true,
      created_at: true,
      updated_at: true,
    },
  });
};

const createUser = async (userData) => {
  const {
    username,
    email,
    password,
    full_name,
    role,
    phone,
    department,
    office_location,
    gender,
    street,
    city,
    state,
    pincode,
    createdBy,
    is_active = true,
  } = userData;

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
      phone,
      department,
      office_location,
      gender,
      street,
      city,
      state,
      pincode,
      created_by: createdBy,
      is_active,
      permissions: defaultPermissions,
    },
  });

  const userId = newUser.id;

  // Auto-assign default folders based on role
  if (effectiveRole) {
    await assignDefaultFolders(userId, effectiveRole);
  }

  return userId;
};

const assignDefaultFolders = async (userId, roleName) => {
  try {
    const folderIds = await getDefaultFolderIdsForRole(roleName);
    if (!folderIds || folderIds.length === 0) return;

    // Execute bulk insert via raw query due to ON CONFLICT requirement
    for (const fid of folderIds) {
      await prisma.$queryRaw`
        INSERT INTO user_folder_access (user_id, folder_id, can_read, can_write, can_edit, can_delete)
        VALUES (${parseInt(userId, 10)}, ${parseInt(fid, 10)}, true, false, false, false)
        ON CONFLICT (user_id, folder_id) DO NOTHING
      `;
    }
  } catch (error) {
    console.error(`Failed to assign default folders for user ${userId} (role: ${roleName}):`, error);
  }
};

const createUserSettings = async (userId) => {
  const defaultPrefs = {
    theme: 'light',
    notifications_enabled: true,
    default_map_type: 'satellite',
    default_zoom: 10
  };
  
  await prisma.users.update({
    where: { id: parseInt(userId, 10) },
    data: { map_preferences: defaultPrefs }
  });
};

const findOrCreateRegion = async (regionName) => {
  const region = await prisma.regions.findFirst({
    where: {
      name: regionName,
      is_active: true,
    },
  });

  if (region) return region.id;

  let regionCode = (
    regionName.substring(0, 2) + regionName.charAt(regionName.length - 1)
  ).toUpperCase();
  let codeAttempt = regionCode;
  let attempts = 0;
  let regionId;

  while (attempts < 10) {
    try {
      const newRegion = await prisma.regions.create({
        data: {
          name: regionName,
          code: codeAttempt,
          type: "state",
          is_active: true,
        },
      });
      regionId = newRegion.id;
      break;
    } catch (insertErr) {
      if (insertErr.code === "P2002") {
        // Prisma unique constraint violation code
        attempts++;
        codeAttempt = regionCode + attempts;
      } else {
        throw insertErr;
      }
    }
  }
  if (!regionId) throw new Error(`Failed to create region ${regionName}`);
  return regionId;
};

const assignUserRegions = async (userId, regionNames, assignedBy) => {
  if (!regionNames || !Array.isArray(regionNames) || regionNames.length === 0)
    return;

  for (const regionName of regionNames) {
    try {
      const regionId = await findOrCreateRegion(regionName);
      await prisma.$queryRaw`
        INSERT INTO user_regions (user_id, region_id, access_level, assigned_by)
        VALUES (${parseInt(userId, 10)}, ${regionId}, 'read', ${assignedBy || null})
        ON CONFLICT (user_id, region_id) DO NOTHING
      `;
    } catch (err) {
      console.error(`Error assigning region ${regionName}:`, err);
    }
  }
};

const updateUser = async (userId, updates, params) => {
  if (updates.length > 0) {
    // Keep raw query for dynamic updates arrays, or ideally convert upstream to use data objects.
    // We'll use pool.query here temporarily since 'updates' is a dynamic string array ("field = ?").
    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );
  }
};

const clearUserRegions = async (userId) => {
  await prisma.user_regions.deleteMany({
    where: { user_id: parseInt(userId, 10) },
  });
};

const getUserRegions = async (userId) => {
  const regions = await prisma.$queryRaw`
    SELECT r.name FROM regions r
    INNER JOIN user_regions ur ON r.id = ur.region_id
    WHERE ur.user_id = ${parseInt(userId, 10)}
  `;
  return regions.map((r) => r.name);
};

const getUserRegionsDetails = async (userId) => {
  const regions = await prisma.$queryRaw`
    SELECT r.id, r.name, r.code, r.type, ur.access_level
    FROM regions r
    INNER JOIN user_regions ur ON r.id = ur.region_id
    WHERE ur.user_id = ${parseInt(userId, 10)}
  `;
  return regions;
};

const getAllUsers = async (page = 1, limit = 10, search = "", role) => {
  const offset = (page - 1) * limit;

  // Use Prisma's findMany for standard listing if we don't need complex aggregation,
  // but since we need STRING_AGG, we will use Prisma.$queryRawUnsafe
  
  let countQuery = "SELECT COUNT(*) as total FROM users WHERE 1=1";
  
  if (search) {
    countQuery += ` AND (username ILIKE '%${search}%' OR email ILIKE '%${search}%' OR full_name ILIKE '%${search}%')`;
  }
  if (role) {
    countQuery += ` AND role = '${role}'`;
  }

  const countResult = await prisma.$queryRawUnsafe(countQuery);
  // Postgres COUNT returns a BigInt, convert to Number
  const total = countResult[0] ? Number(countResult[0].total) : 0;

  // Optimized query with JOINs
  let query = `
    SELECT 
      u.id, u.username, u.email, u.full_name, u.gender, u.role, u.phone, 
      u.department, u.office_location, u.street, u.city, u.state, u.pincode, 
      u.is_active, u.is_email_verified, u.email_verified_at, u.permissions,
      u.mfa_enabled, u.mfa_method, u.mfa_enabled_at, u.created_at, u.last_active_at,
      STRING_AGG(DISTINCT r.name, '|||') as region_names,
      STRING_AGG(DISTINCT CONCAT_WS(':::', 
        ta.id, ta_r.name, ta.end_time, 
        EXTRACT(EPOCH FROM (ta.end_time - NOW())),
        ta_u.full_name, ta.start_time, ta.reason
      ), '|||') as temp_access_data
    FROM users u
    LEFT JOIN user_regions ur ON u.id = ur.user_id
    LEFT JOIN regions r ON ur.region_id = r.id AND r.is_active::boolean = true
    LEFT JOIN temporary_access_log ta ON u.id = ta.user_id 
      AND ta.status != 'revoked' 
      AND ta.end_time > NOW()
    LEFT JOIN regions ta_r ON ta.region_id = ta_r.id
    LEFT JOIN users ta_u ON ta.granted_by = ta_u.id
    WHERE 1=1
  `;

  if (search) {
    query += ` AND (u.username ILIKE '%${search}%' OR u.email ILIKE '%${search}%' OR u.full_name ILIKE '%${search}%')`;
  }
  if (role) {
    query += ` AND u.role = '${role}'`;
  }

  query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}`;

  const users = await prisma.$queryRawUnsafe(query);

  return { users, total };
};

module.exports = {
  findUserByEmailOrUsername,
  findUserById,
  getAllUsers,
  createUser,
  createUserSettings,
  findOrCreateRegion,
  assignUserRegions,
  updateUser,
  clearUserRegions,
  getUserRegions,
  getUserRegionsDetails,
  assignDefaultFolders,
};
