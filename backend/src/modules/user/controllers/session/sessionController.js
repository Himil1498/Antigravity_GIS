const { pool } = require('../../../../config/database');
const { logAudit } = require('../../../audit/audit.service');
const { createNotification } = require('../../../notification/services/notification.service');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, AUDIT_ACTIONS, NOTIFICATION_TYPES } = require('./constants');

/**
 * @route   POST /api/users/:id/force-logout
 * @desc    Force logout all sessions for a user (Admin only)
 * @access  Private (Admin)
 */
const forceLogoutUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Get user details
    const [users] = await pool.query(
      'SELECT id, username, full_name, email FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }

    const user = users[0];

    // Mark all active sessions as expired (force logout)
    const [result] = await pool.query(
      `UPDATE user_sessions
       SET expires_at = NOW()
       WHERE user_id = ? AND expires_at > NOW()`,
      [id]
    );

    // Set user offline
    await pool.query(
      'UPDATE users SET is_online = FALSE WHERE id = ?',
      [id]
    );

    // Send notification to user
    await createNotification(
      id,
      NOTIFICATION_TYPES.SECURITY_ALERT,
      '🚪 Session Terminated',
      'Your session has been terminated by an administrator for security reasons. Please log in again if you need access.',
      {
        data: {
          terminatedBy: req.user.full_name || req.user.username,
          reason: 'Admin forced logout',
          sessionsTerminated: result.affectedRows
        },
        priority: 'high',
        action_url: '/login',
        action_label: 'Login Again'
      }
    );

    // Log audit
    await logAudit(adminId, AUDIT_ACTIONS.FORCE_LOGOUT, 'user', id, {
      username: user.username,
      sessions_terminated: result.affectedRows,
      admin: req.user.username
    }, req);

    // Send WebSocket notification to user for immediate logout
    try {
      const websocketServer = require('../../../../shared/services/websocketService');
      websocketServer.forceLogoutUser(id, `Your session was terminated by admin: ${req.user.username}`);
    } catch (wsError) {
      console.warn('WebSocket notification failed:', wsError);
    }

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS(result.affectedRows, user.username),
      sessionsTerminated: result.affectedRows
    });

  } catch (error) {
    console.error('Force logout error:', error);
    res.status(500).json({
      success: false,
      error: ERROR_MESSAGES.FAILED_FORCE_LOGOUT
    });
  }
};

module.exports = { forceLogoutUser };
