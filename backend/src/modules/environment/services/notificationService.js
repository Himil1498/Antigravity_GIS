/**
 * Environment Validator - Notification Service
 */

const { pool } = require('../../../config/database');
const { sendDevToolsNotification } = require('../../../shared/services/email');

/**
 * Sends email notifications to all admins with notifications enabled
 */
async function sendAdminNotifications(toolType, reportType, status, duration, stats = {}, errorMessage = null) {
  try {
    // Query all admins with email notifications enabled
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
    // Don't throw - email failures shouldn't break the validation
  }
}

module.exports = {
  sendAdminNotifications
};
