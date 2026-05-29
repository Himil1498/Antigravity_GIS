const { pool } = require('../../config/database');

/**
 * Get dashboard analytics for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Dashboard analytics object
 */
const getDashboardAnalytics = async (userId) => {
  const analytics = {};

  // Safe query helper to prevent missing table crashes
  const safeCount = async (query, params) => {
    try {
      const [result] = await pool.query(query, params);
      return result;
    } catch (error) {
      return [{ count: 0 }];
    }
  };

  // Execute counts in parallel for performance
  // NOTE: Legacy GIS tool tables (distance_measurements, polygon_drawings, 
  // circle_drawings, elevation_profiles) were dropped in the 20260501 migration.
  // These tools are now transient-only (no DB persistence).
  const [
    sectors,
    infrastructure,
    bookmarks,
    layers,
    regions,
    recent
  ] = await Promise.all([
    safeCount('SELECT COUNT(*) as count FROM sector_rf_data WHERE user_id = $1', [userId]),
    safeCount('SELECT COUNT(*) as count FROM network_features WHERE properties->>\'created_by\' = $1::text', [userId]),
    safeCount('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = $1', [userId]),
    safeCount('SELECT COUNT(*) as count FROM layer_management WHERE user_id = $1', [userId]),
    safeCount('SELECT COUNT(*) as count FROM regions WHERE is_active = true', []),
    safeCount(
        `SELECT COUNT(*) as count FROM (
          SELECT created_at FROM sector_rf_data WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
          UNION ALL
          SELECT created_at FROM audit_logs WHERE user_id = $2 AND created_at >= NOW() - INTERVAL '7 days'
        ) as recent_activity`,
        [userId, userId]
      )
  ]);

  // Legacy counters zeroed out (tools are now transient, no DB records)
  analytics.total_measurements = 0;
  analytics.total_polygons = 0;
  analytics.total_circles = 0;
  analytics.total_sectors = sectors[0].count;
  analytics.total_infrastructure = infrastructure[0].count;
  analytics.total_bookmarks = bookmarks[0].count;
  analytics.total_layers = layers[0].count;
  analytics.total_regions = regions[0].count;
  analytics.recent_activity_count = recent[0].count;

  return analytics;
};

/**
 * Get region analytics for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of region analytics
 */
const getRegionAnalytics = async (userId) => {
  let regions = [];
  try {
    const [result] = await pool.query(
      `SELECT
        r.id,
        r.name,
        r.type,
        0 as infrastructure_count,
        0 as measurement_count
       FROM regions r
       INNER JOIN user_regions ur ON r.id = ur.region_id
       WHERE ur.user_id = $1
       GROUP BY r.id, r.name, r.type`,
      [userId]
    );
    regions = result;
  } catch(e) {
    console.warn(`getRegionAnalytics failed: ${e.message}`);
  }
  return regions;
};

/**
 * Get feature analytics for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of feature analytics
 */
const getFeatureAnalytics = async (userId) => {
  try {
    const [features] = await pool.query(
      `SELECT
        feature_type,
        COUNT(*) as count
       FROM gis_features
       WHERE created_by = $1
       GROUP BY feature_type`,
      [userId]
    );
    return features;
  } catch (e) {
    console.warn(`getFeatureAnalytics failed: ${e.message}`);
    return [];
  }
};

/**
 * Get recent activity list for a user
 * @param {number} userId - User ID
 * @param {number} limit - Number of activities to return
 * @returns {Promise<Array>} Array of recent activities
 */
const getRecentActivityList = async (userId, limit = 10) => {
  let query = `SELECT 
      al.id,
      al.action,
      al.details,
      al.created_at as timestamp,
      COALESCE(u.full_name, 'System') as user
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id`;
     
  const params = [];
  
  if (userId) {
    query += ` WHERE al.user_id = $1`;
    params.push(userId);
  }
  
  query += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1}`;
  params.push(parseInt(limit));

  const [activities] = await pool.query(query, params);
  
  // Parse details to extract type and region if available
  return activities.map(activity => {
    let type = 'unknown';
    let region = 'N/A';
    
    try {
      const details = typeof activity.details === 'string' 
        ? JSON.parse(activity.details) 
        : activity.details;
      
      if (details) {
        type = details.type || details.entity_type || 'unknown';
        region = details.region || 'N/A';
      }
    } catch (e) {
      // If details is not JSON, keep defaults
    }
    
    return {
      ...activity,
      type,
      region
    };
  });
};

/**
 * Get Feasibility Check Stats (Mocked for now since it's a new feature)
 */
const getFeasibilityStats = async () => {
  return {
    total_checks: 124,
    successful: 82,
    unfeasible: 42,
    failure_reasons: {
      "Line of Sight": 28,
      "Distance Limit Exceeded": 10,
      "Elevation Blocked": 4
    }
  };
};

/**
 * Get Peak Usage Heatmap Data
 */
const getPeakUsage = async () => {
  try {
    const [results] = await pool.query(`
      SELECT 
        EXTRACT(DOW FROM created_at) as day_of_week,
        EXTRACT(HOUR FROM created_at) as hour_of_day,
        COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY day_of_week, hour_of_day
    `);
    return results;
  } catch (error) {
    console.error("Peak usage query error:", error);
    return [];
  }
};

/**
 * Get Detailed Error Logs
 */
const getErrorLogs = async (limit = 20) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        al.id,
        al.action,
        al.details,
        al.created_at as timestamp,
        COALESCE(u.full_name, 'System') as user
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.action ILIKE '%fail%' 
         OR al.action ILIKE '%error%' 
         OR al.details::text ILIKE '%error%'
      ORDER BY al.created_at DESC
      LIMIT $1
    `, [parseInt(limit)]);
    return results;
  } catch (error) {
    console.error("Error logs query error:", error);
    return [];
  }
};

module.exports = {
  getDashboardAnalytics,
  getRegionAnalytics,
  getFeatureAnalytics,
  getRecentActivityList,
  getFeasibilityStats,
  getPeakUsage,
  getErrorLogs
};
