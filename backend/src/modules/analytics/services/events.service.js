const { pool } = require('../../../config/database');

/**
 * Track a custom analytics event
 * @param {number} userId - User ID
 * @param {string} eventName - Event name
 * @param {Object|null} eventData - Optional event data
 * @returns {Promise<void>}
 */
const trackEvent = async (userId, eventName, eventData = null) => {
  await pool.query(
    `INSERT INTO analytics_metrics (user_id, metric_name, metric_value, metadata)
     VALUES (?, ?, 1, ?)`,
    [userId, eventName, eventData ? JSON.stringify(eventData) : null]
  );
};

module.exports = {
  trackEvent
};
