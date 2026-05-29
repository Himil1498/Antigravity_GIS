/**
 * Group Query Service
 * Database operations for groups
 */

const { pool } = require('../../../config/database');
const { ROLES } = require('../constants');

/**
 * Gets all groups for a user
 */
async function getAllGroups(userId) {
  const [groups] = await pool.query(
    `SELECT g.*,
            COUNT(DISTINCT gm.id) as member_count,
            gm2.role as user_role
     FROM "groups" g
     LEFT JOIN group_members gm ON g.id = gm.group_id
     INNER JOIN group_members gm2 ON g.id = gm2.group_id AND gm2.user_id = ?
     GROUP BY g.id, gm2.role
     ORDER BY g.created_at DESC`,
    [userId]
  );

  return groups;
}

/**
 * Checks if user is a member of a group
 */
async function checkMembership(groupId, userId) {
  const [membership] = await pool.query(
    'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
    [groupId, userId]
  );

  return membership.length > 0 ? membership[0] : null;
}

/**
 * Gets group by ID
 */
async function getGroupById(groupId) {
  const [groups] = await pool.query(
    `SELECT g.*,
            u.username as owner_username,
            u.full_name as owner_name
     FROM "groups" g
     INNER JOIN users u ON g.created_by = u.id
     WHERE g.id = ?`,
    [groupId]
  );

  return groups.length > 0 ? groups[0] : null;
}

/**
 * Creates a new group
 */
async function createGroup(userId, name, description, is_active = true) {
  // Create group
  const [result] = await pool.query(
    `INSERT INTO "groups" (name, description, created_by, is_active)
     VALUES (?, ?, ?, ?)
     RETURNING id`,
    [name, description, userId, is_active]
  );

  const groupId = result[0].id;

  // Add creator as owner member
  await pool.query(
    `INSERT INTO group_members (group_id, user_id, role, added_by)
     VALUES (?, ?, ?, ?)`,
    [groupId, userId, ROLES.OWNER, userId]
  );

  return groupId;
}

/**
 * Checks if user is the creator of a group
 */
async function checkCreator(groupId, userId) {
  const [groups] = await pool.query(
    'SELECT created_by FROM "groups" WHERE id = ?',
    [groupId]
  );

  if (groups.length === 0) {
    return { found: false };
  }

  return {
    found: true,
    isCreator: groups[0].created_by === userId
  };
}

/**
 * Updates a group
 */
async function updateGroup(groupId, updates) {
  const updateFields = [];
  const params = [];

  if (updates.name) {
    updateFields.push('name = ?');
    params.push(updates.name);
  }
  if (updates.description !== undefined) {
    updateFields.push('description = ?');
    params.push(updates.description);
  }
  if (updates.is_active !== undefined) {
    updateFields.push('is_active = ?');
    params.push(updates.is_active);
  }

  if (updateFields.length === 0) {
    return { updated: false };
  }

  updateFields.push('updated_at = NOW()');
  params.push(groupId);

  await pool.query(
    `UPDATE "groups" SET ${updateFields.join(', ')} WHERE id = ?`,
    params
  );

  return { updated: true };
}

/**
 * Deletes a group
 */
async function deleteGroup(groupId) {
  await pool.query('DELETE FROM "groups" WHERE id = ?', [groupId]);
}

module.exports = {
  getAllGroups,
  checkMembership,
  getGroupById,
  createGroup,
  checkCreator,
  updateGroup,
  deleteGroup
};
