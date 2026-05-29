const { pool } = require("../../../../config/database");
const { calculateTimeRemaining } = require("../../../../shared/utils/time");

/**
 * @route   GET /api/users/:id/session-stats
 * @desc    Get user session statistics for dashboard modal
 * @access  Private (Admin)
 */
const getUserSessionStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Get active sessions count
    const [activeSessions] = await pool.query(
      `SELECT COUNT(*) as count FROM user_sessions WHERE user_id = $1 AND expires_at > NOW()`,
      [id],
    );

    // Get total actions in last 7 days from audit logs (PostgreSQL syntax)
    const [actionCount] = await pool.query(
      `SELECT COUNT(*) as count FROM audit_logs
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
      [id],
    );

    // Get total time today (sum of session durations) - PostgreSQL syntax
    const [timeToday] = await pool.query(
      `SELECT
         COALESCE(SUM(
           EXTRACT(EPOCH FROM (
             CASE
               WHEN expires_at < NOW() THEN expires_at
               ELSE COALESCE(last_activity, NOW())
             END - created_at
           )) / 60
         ), 0) as total_minutes
       FROM user_sessions WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE`,
      [id],
    );

    // Get current active session details
    const [currentSession] = await pool.query(
      `SELECT ip_address, user_agent as device_info, created_at as login_time, last_activity as last_activity_time
       FROM user_sessions WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [id],
    );

    const totalMinutes = parseInt(timeToday[0]?.total_minutes) || 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    res.json({
      success: true,
      stats: {
        activeSessions: parseInt(activeSessions[0]?.count) || 0,
        totalActions: parseInt(actionCount[0]?.count) || 0,
        totalTimeToday: {
          raw: totalMinutes,
          formatted: `${hours}h ${minutes}m`,
        },
        currentSession: currentSession[0] || null,
      },
    });
  } catch (error) {
    console.error("Get user session stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get session stats",
    });
  }
};

module.exports = { getUserSessionStats };
