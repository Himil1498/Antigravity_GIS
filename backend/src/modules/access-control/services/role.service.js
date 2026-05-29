const { pool } = require("../../../config/database");

/**
 * Helper: parse JSON fields safely
 */
const parseJsonField = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch (e) { return fallback; }
  }
  return fallback;
};

/**
 * Helper: Normalize a role row (parse permissions + default_folder_ids)
 */
const normalizeRole = (role) => ({
  ...role,
  permissions: parseJsonField(role.permissions),
  default_folder_ids: parseJsonField(role.default_folder_ids),
});

/**
 * Get all roles
 */
const getAllRoles = async (includeInactive = false) => {
  let query = `SELECT id, name, display_name, description, permissions, default_folder_ids, color, icon, is_system, is_active, created_by, created_at, updated_at
               FROM roles`;
  if (!includeInactive) {
    query += " WHERE is_active = true";
  }
  query += " ORDER BY is_system DESC, display_name ASC";

  const [roles] = await pool.query(query);
  return roles.map(normalizeRole);
};

/**
 * Get role by name
 */
const getRoleByName = async (name) => {
  const [roles] = await pool.query(
    "SELECT * FROM roles WHERE name = ?",
    [name.toLowerCase()]
  );
  if (roles.length === 0) return null;
  return normalizeRole(roles[0]);
};

/**
 * Get role by ID
 */
const getRoleById = async (id) => {
  const [roles] = await pool.query(
    "SELECT * FROM roles WHERE id = ?",
    [id]
  );
  if (roles.length === 0) return null;
  return normalizeRole(roles[0]);
};

/**
 * Create a new role
 */
const createRole = async ({ name, display_name, description, permissions, default_folder_ids, color, icon, createdBy }) => {
  const [result] = await pool.query(
    `INSERT INTO roles (name, display_name, description, permissions, default_folder_ids, color, icon, is_system, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, false, ?)
     RETURNING id`,
    [
      name.toLowerCase(),
      display_name,
      description || '',
      JSON.stringify(permissions || []),
      JSON.stringify(default_folder_ids || []),
      color || '#6B7280',
      icon || 'user',
      createdBy,
    ]
  );
  return result[0].id;
};

/**
 * Update a role
 */
const updateRole = async (id, { display_name, description, permissions, default_folder_ids, color, icon, is_active }) => {
  const updates = [];
  const params = [];

  if (display_name !== undefined) {
    updates.push("display_name = ?");
    params.push(display_name);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    params.push(description);
  }
  if (permissions !== undefined) {
    updates.push("permissions = ?");
    params.push(JSON.stringify(permissions));
  }
  if (default_folder_ids !== undefined) {
    updates.push("default_folder_ids = ?");
    params.push(JSON.stringify(default_folder_ids));
  }
  if (color !== undefined) {
    updates.push("color = ?");
    params.push(color);
  }
  if (icon !== undefined) {
    updates.push("icon = ?");
    params.push(icon);
  }
  if (is_active !== undefined) {
    updates.push("is_active = ?");
    params.push(is_active);
  }

  updates.push("updated_at = NOW()");
  params.push(id);

  if (updates.length === 1) return; // Only updated_at

  await pool.query(
    `UPDATE roles SET ${updates.join(", ")} WHERE id = ?`,
    params
  );
};

/**
 * Delete a role (soft delete - set is_active = false)
 */
const deleteRole = async (id) => {
  await pool.query(
    "UPDATE roles SET is_active = false, updated_at = NOW() WHERE id = ? AND is_system = false",
    [id]
  );
};

/**
 * Get permissions for a role name (used by user.service.js on user creation)
 */
const getDefaultPermissionsForRole = async (roleName) => {
  const role = await getRoleByName(roleName);
  if (role) {
    return role.permissions;
  }
  // Fallback to hardcoded defaults if role not found in DB
  const { DEFAULT_ROLE_PERMISSIONS } = require("../../access-control/constants/rolePermissions");
  return DEFAULT_ROLE_PERMISSIONS[roleName] || [];
};

/**
 * Get default folder IDs for a role name (used on user creation to auto-assign folder access)
 */
const getDefaultFolderIdsForRole = async (roleName) => {
  const role = await getRoleByName(roleName);
  if (role) {
    return role.default_folder_ids || [];
  }
  return [];
};

/**
 * Get count of users for each role
 */
const getRoleUserCounts = async () => {
  const [rows] = await pool.query(
    `SELECT role, COUNT(*) as user_count FROM users GROUP BY role`
  );
  const counts = {};
  rows.forEach(row => {
    counts[row.role] = parseInt(row.user_count);
  });
  return counts;
};

/**
 * Propagate folder access to all users with a specific role
 * (Additive only: Adds missing folders, does not remove existing ones)
 */
const propagateFolderAccess = async (roleName, folderIds) => {
  if (!folderIds || folderIds.length === 0) return;

  // 1. Get all users with this role
  const [users] = await pool.query("SELECT id FROM users WHERE role = ?", [roleName]);
  if (users.length === 0) return;

  // 2. Assign folders to each user
  for (const user of users) {
    for (const fid of folderIds) {
      // Use efficient ON CONFLICT DO NOTHING
      await pool.query(
        `INSERT INTO user_folder_access (user_id, folder_id, can_read, can_write, can_edit, can_delete)
         VALUES (?, ?, true, false, false, false)
         ON CONFLICT (user_id, folder_id) DO NOTHING`,
        [user.id, fid]
      );
    }
  }
};

module.exports = {
  getAllRoles,
  getRoleByName,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getDefaultPermissionsForRole,
  getDefaultFolderIdsForRole,
  getRoleUserCounts,
  propagateFolderAccess,
};
