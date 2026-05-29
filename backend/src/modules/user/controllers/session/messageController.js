const { pool } = require('../../../../config/database');
const { logAudit } = require('../../../audit/audit.service');
const { createNotification } = require('../../../notification/services/notification.service');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, AUDIT_ACTIONS, NOTIFICATION_TYPES } = require('./constants');

/**
 * @route   POST /api/admin/send-message
 * @desc    Send message from admin to user via notification
 * @access  Private (Admin)
 */
const sendAdminMessage = async (req, res) => {
  try {
    const { userId, message, priority = 'medium' } = req.body;
    const adminId = req.user.id;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: ERROR_MESSAGES.USER_ID_MSG_REQUIRED
      });
    }

    // Get user details
    const [users] = await pool.query(
      'SELECT id, username, full_name, email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }

    const user = users[0];

    // Send notification
    await createNotification(
      userId,
      NOTIFICATION_TYPES.USER_ACTIVITY,
      '💬 Message from Administrator',
      message,
      {
        data: {
          from: req.user.full_name || req.user.username,
          fromEmail: req.user.email,
          sentAt: new Date()
        },
        priority: priority,
        action_url: '/notifications',
        action_label: 'View Messages'
      }
    );

    // Log audit
    await logAudit(adminId, AUDIT_ACTIONS.SEND_MESSAGE, 'user', userId, {
      recipient: user.username,
      message: message,
      priority: priority
    }, req);

    console.log(`✅ Admin ${req.user.username} sent message to user ${user.username}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.MESSAGE_SENT(user.full_name || user.username)
    });

  } catch (error) {
    console.error('Send admin message error:', error);
    res.status(500).json({
      success: false,
      error: ERROR_MESSAGES.FAILED_SEND_MESSAGE
    });
  }
};

module.exports = { sendAdminMessage };
