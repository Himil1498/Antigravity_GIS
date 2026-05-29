/**
 * Notification Service
 * Handles email notifications for backup operations
 */

const { pool } = require('../../../config/database');
const { sendDevToolsNotification } = require('../../../shared/services/email');

/**
 * Send email notifications to admins
 * @param {Object} options - Notification options
 * @returns {Promise<void>}
 */
const sendAdminNotifications = async (options) => {
  const {
    toolType,
    reportType,
    status,
    duration,
    stats = {},
    errorMessage = null
  } = options;

  try {
    // Query all admins (simplified since dev_tool_settings is missing)
    const [admins] = await pool.query(`
      SELECT u.id, u.email, u.username, u.full_name
      FROM users u
      WHERE u.role = 'admin' AND u.email IS NOT NULL
    `);

    // Send email to each admin
    for (const admin of admins) {
      await sendDevToolsNotification({
        toolType,
        reportType,
        status,
        duration,
        stats,
        errorMessage,
        adminEmail: admin.email,
        adminName: admin.full_name || admin.username || 'Admin'
      });
    }
  } catch (emailError) {
    console.error('Failed to send email notifications:', emailError.message);
    // Don't throw - email failures shouldn't break the backup
  }
};

module.exports = {
  sendAdminNotifications
};






