const authService = require('../auth.service');
const { formatUserResponse } = require('../auth.utils');
const { pool } = require('../../../config/database');

const ERRORS = {
  USER_NOT_FOUND: 'User not found'
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: ERRORS.USER_NOT_FOUND
      });
    }

    // Get user's regions
    const regions = await authService.getUserRegions(userId);

    // Get active sessions
    const activeSessions = await authService.getActiveSessions(userId);

    // Format user data
    const formattedUser = formatUserResponse(user, regions);
    formattedUser.active_sessions = activeSessions;

    res.json({
      success: true,
      user: formattedUser
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
};

const getMyRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent activity from audit logs
    const [activities] = await pool.query(
      `SELECT
         action,
         resource_type,
         resource_id,
         details,
         ip_address,
         created_at
       FROM audit_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    // Format activities for display
    const formattedActivities = activities.map(activity => {
      let description = '';

      switch (activity.action) {
        case 'CREATE':
          description = `Created ${activity.resource_type} ${activity.resource_id || ''}`;
          break;
        case 'UPDATE':
          description = `Updated ${activity.resource_type} ${activity.resource_id || ''}`;
          break;
        case 'DELETE':
          description = `Deleted ${activity.resource_type} ${activity.resource_id || ''}`;
          break;
        case 'VIEW':
          description = `Viewed ${activity.resource_type} ${activity.resource_id || ''}`;
          break;
        case 'LOGIN':
          description = `Logged in from ${activity.ip_address || 'unknown IP'}`;
          break;
        case 'LOGOUT':
          description = 'Logged out';
          break;
        default:
          description = `${activity.action} ${activity.resource_type || ''}`;
      }

      return {
        type: activity.action.toLowerCase(),
        title: description,
        timestamp: activity.created_at,
        location: activity.ip_address === "127.0.0.1" || activity.ip_address === "::1" ? "Local Network" : activity.ip_address,
      };
    });

    res.json({
      success: true,
      activities: formattedActivities,
      count: formattedActivities.length
    });

  } catch (error) {
    console.error('Get my recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent activity'
    });
  }
};

module.exports = {
  getCurrentUser,
  getMyRecentActivity
};
