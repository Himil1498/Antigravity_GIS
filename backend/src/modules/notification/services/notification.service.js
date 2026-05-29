const { pool } = require("../../../config/database");

/**
 * Creates a notification
 * @param {number} userId - Target user ID
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} options - Optional: { action_url, related_entity_id, related_entity_type }
 */
const createNotification = async (
  userId,
  type,
  title,
  message,
  options = {},
) => {
  try {
    const { action_url, related_entity_id, related_entity_type } = options;

    await pool.query(
      `INSERT INTO notifications
       (user_id, type, title, message, action_url, related_entity_id, related_entity_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        type,
        title,
        message,
        action_url || null,
        related_entity_id || null,
        related_entity_type || null,
      ],
    );
    console.log(`✅ Notification created for user ${userId}: ${title}`);
  } catch (error) {
    console.error("Create notification error:", error);
    throw error;
  }
};

/**
 * Notifies all admins
 */
const notifyAllAdmins = async (type, title, message, options = {}) => {
  try {
    const [admins] = await pool.query(
      "SELECT id FROM users WHERE LOWER(role) = 'admin' AND is_active = TRUE",
    );

    if (admins.length === 0) return;

    const { action_url, related_entity_id, related_entity_type } = options;

    // Construct values part of the query: ($1, $2, ...), ($8, $9, ...), ...
    const valueTuples = [];
    const params = [];
    let paramIdx = 1;

    admins.forEach((admin) => {
      valueTuples.push(
        `($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, $${paramIdx + 4}, $${paramIdx + 5}, $${paramIdx + 6})`,
      );
      params.push(
        admin.id,
        type,
        title,
        message,
        action_url || null,
        related_entity_id || null,
        related_entity_type || null,
      );
      paramIdx += 7;
    });

    const query = `
      INSERT INTO notifications
       (user_id, type, title, message, action_url, related_entity_id, related_entity_type)
      VALUES ${valueTuples.join(", ")}
    `;

    await pool.query(query, params);
    console.log(`✅ Notified ${admins.length} admins: ${title}`);
  } catch (error) {
    console.error("Notify all admins error:", error);
    throw error;
  }
};

/**
 * Notifies all active users with specified roles
 * @param {string[]} roles - Array of role names (e.g., ['admin', 'developer'])
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} options - Optional: { action_url, related_entity_id, related_entity_type }
 */
const notifyRoles = async (roles, type, title, message, options = {}) => {
  try {
    // Build parameterized role filter
    const rolePlaceholders = roles.map((_, i) => `$${i + 1}`).join(", ");
    const [users] = await pool.query(
      `SELECT id FROM users WHERE LOWER(role) IN (${rolePlaceholders}) AND is_active = TRUE`,
      roles.map((r) => r.toLowerCase()),
    );

    if (users.length === 0) return;

    const { action_url, related_entity_id, related_entity_type } = options;

    const valueTuples = [];
    const params = [];
    let paramIdx = 1;

    users.forEach((user) => {
      valueTuples.push(
        `($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, $${paramIdx + 4}, $${paramIdx + 5}, $${paramIdx + 6})`,
      );
      params.push(
        user.id,
        type,
        title,
        message,
        action_url || null,
        related_entity_id || null,
        related_entity_type || null,
      );
      paramIdx += 7;
    });

    const query = `
      INSERT INTO notifications
       (user_id, type, title, message, action_url, related_entity_id, related_entity_type)
      VALUES ${valueTuples.join(", ")}
    `;

    await pool.query(query, params);
    console.log(`✅ Notified ${users.length} users in roles [${roles.join(", ")}]: ${title}`);
  } catch (error) {
    console.error("Notify roles error:", error);
    // Non-critical: don't throw, just log
  }
};

/**
 * Notifies all active users
 */
const notifyAllUsers = async (type, title, message, options = {}) => {
  try {
    const [users] = await pool.query(
      "SELECT id FROM users WHERE is_active = TRUE",
    );

    if (users.length === 0) return;

    const { action_url, related_entity_id, related_entity_type } = options;
    const valueTuples = [];
    const params = [];
    let paramIdx = 1;

    users.forEach((user) => {
      valueTuples.push(
        `($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, $${paramIdx + 4}, $${paramIdx + 5}, $${paramIdx + 6})`,
      );
      params.push(
        user.id,
        type,
        title,
        message,
        action_url || null,
        related_entity_id || null,
        related_entity_type || null,
      );
      paramIdx += 7;
    });

    const query = `
      INSERT INTO notifications
       (user_id, type, title, message, action_url, related_entity_id, related_entity_type)
      VALUES ${valueTuples.join(", ")}
    `;

    await pool.query(query, params);
    
    // Broadcast via WebSocket explicitly if needed, but the backend architecture 
    // likely has a DB trigger or polling mechanism for notifications.
    console.log(`✅ Notified all ${users.length} active users: ${title}`);
  } catch (error) {
    console.error("Notify all users error:", error);
  }
};

const getMyNotifications = async (userId, unreadOnly) => {
  let query = `
      SELECT
        id,
        user_id,
        type,
        title,
        message,
        action_url,
        related_entity_id,
        related_entity_type,
        is_read,
        read_at,
        created_at
      FROM notifications WHERE user_id = $1
    `;
  const params = [userId];

  if (unreadOnly) {
    query += " AND is_read = FALSE";
  }
  query += " ORDER BY created_at DESC LIMIT 50";

  const [notifications] = await pool.query(query, params);
  return notifications;
};

const getUnreadCount = async (userId) => {
  const [result] = await pool.query(
    "SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE",
    [userId],
  );
  return result[0].count;
};

const markAsRead = async (userId, notificationId) => {
  await pool.query(
    "UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = $1 AND user_id = $2",
    [notificationId, userId],
  );
};

const markAllAsRead = async (userId) => {
  await pool.query(
    "UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = $1 AND is_read = FALSE",
    [userId],
  );
};

const deleteNotification = async (userId, notificationId) => {
  await pool.query("DELETE FROM notifications WHERE id = $1 AND user_id = $2", [
    notificationId,
    userId,
  ]);
};

const clearAllRead = async (userId) => {
  await pool.query(
    "DELETE FROM notifications WHERE user_id = $1 AND is_read = TRUE",
    [userId],
  );
};

module.exports = {
  createNotification,
  notifyAllAdmins,
  notifyRoles,
  notifyAllUsers,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllRead,
};
