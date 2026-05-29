/**
 * Group Member Query Service
 * Database operations for group members
 */

const { pool } = require('../../../config/database');
const { ROLES } = require('../constants');

/**
 * Gets all members of a group
 */
async function getGroupMembers(groupId) {
  const [members] = await pool.query(
    `SELECT gm.*,
            u.username,
            u.full_name,
            u.email,
            u.role as user_role,
            adder.username as added_by_username
     FROM group_members gm
     INNER JOIN users u ON gm.user_id = u.id
     LEFT JOIN users adder ON gm.added_by = adder.id
     WHERE gm.group_id = ?
     ORDER BY
       CASE gm.role
         WHEN 'owner' THEN 1
         WHEN 'admin' THEN 2
         WHEN 'member' THEN 3
       END,
       gm.added_at ASC`,
    [groupId]
  );

  return members;
}

/**
 * Checks if user can manage members (owner or admin)
 */
async function canManageMembers(groupId, userId) {
  const [membership] = await pool.query(
    'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
    [groupId, userId]
  );

  if (membership.length === 0) {
    return false;
  }

  return membership[0].role === ROLES.OWNER || membership[0].role === ROLES.ADMIN;
}

/**
 * Checks if user is already a member
 */
async function isAlreadyMember(groupId, userId) {
  const [existing] = await pool.query(
    'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
    [groupId, userId]
  );

  return existing.length > 0;
}

/**
 * Checks if user exists
 */
async function userExists(userId) {
  const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
  return users.length > 0;
}

/**
 * Adds a member to a group
 */
async function addGroupMember(groupId, userId, role, addedBy) {
  await pool.query(
    `INSERT INTO group_members (group_id, user_id, role, added_by)
     VALUES (?, ?, ?, ?)`,
    [groupId, userId, role, addedBy]
  );
}

/**
 * Gets member info
 */
async function getMemberInfo(groupId, userId) {
  const [member] = await pool.query(
    'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
    [groupId, userId]
  );

  return member.length > 0 ? member[0] : null;
}

/**
 * Removes a member from a group
 */
async function removeGroupMember(groupId, userId) {
  await pool.query(
    'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
    [groupId, userId]
  );
}

/**
 * Updates member role
 */
async function updateMemberRole(groupId, userId, role) {
  await pool.query(
    'UPDATE group_members SET role = ?, updated_at = NOW() WHERE group_id = ? AND user_id = ?',
    [role, groupId, userId]
  );
}

module.exports = {
  getGroupMembers,
  canManageMembers,
  isAlreadyMember,
  userExists,
  addGroupMember,
  getMemberInfo,
  removeGroupMember,
  updateMemberRole
};
