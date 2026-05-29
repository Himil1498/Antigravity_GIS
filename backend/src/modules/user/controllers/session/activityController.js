const { pool } = require('../../../../config/database');
const { ERROR_MESSAGES } = require('./constants');

/**
 * @route   GET /api/users/:id/recent-activity
 * @desc    Get user's recent activity (last 10 actions)
 * @access  Private (Admin)
 */
const getUserRecentActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

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
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [id, parseInt(limit)]
    );

    // Format activities for display
    const formattedActivities = activities.map(activity => {
      let description = '';

      // Create human-readable descriptions
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
        action: activity.action,
        description,
        resourceType: activity.resource_type,
        resourceId: activity.resource_id,
        timestamp: activity.created_at,
        ipAddress: activity.ip_address
      };
    });

    res.json({
      success: true,
      activities: formattedActivities,
      count: formattedActivities.length
    });

  } catch (error) {
    console.error('Get user recent activity error:', error);
    res.status(500).json({
      success: false,
      error: ERROR_MESSAGES.FAILED_GET_ACTIVITY
    });
  }
};

module.exports = { getUserRecentActivity };
