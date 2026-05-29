/**
 * Feature Query Service - Advanced Operations
 * Database operations for nearby and region queries
 */

const { pool } = require('../../../config/database');
const { CACHE_TABLES } = require('../constants');
/**
 * Gets nearby features using Haversine formula
 */
async function getNearbyFeatures(userId, latitude, longitude, radiusMeters) {
  const [features] = await pool.query(
    `SELECT f.*,
            u.username as created_by_username,
            r.name as region_name,
            (6371000 * acos(
              cos(radians(?)) *
              cos(radians(f.latitude)) *
              cos(radians(f.longitude) - radians(?)) +
              sin(radians(?)) *
              sin(radians(f.latitude))
            )) AS distance
     FROM gis_features f
     INNER JOIN users u ON f.created_by = u.id
     LEFT JOIN regions r ON f.region_id = r.id
     LEFT JOIN user_regions ur ON r.id = ur.region_id
     WHERE (f.created_by = ? OR ur.user_id = ?)
     HAVING distance <= ?
     ORDER BY distance ASC`,
    [latitude, longitude, latitude, userId, userId, radiusMeters]
  );

  return features;
}

/**
 * Checks if user has access to region
 */
async function checkRegionAccess(userId, regionId) {
  const [access] = await pool.query(
    `SELECT id FROM user_regions WHERE user_id = ? AND region_id = ?`,
    [userId, regionId]
  );

  return access.length > 0;
}

/**
 * Gets features by region
 */
async function getFeaturesByRegion(regionId) {
  const [features] = await pool.query(
    `SELECT f.*,
            u.username as created_by_username,
            r.name as region_name
     FROM gis_features f
     INNER JOIN users u ON f.created_by = u.id
     INNER JOIN regions r ON f.region_id = r.id
     WHERE f.region_id = ?
     ORDER BY f.created_at DESC`,
    [regionId]
  );

  return features;
}

module.exports = {
  getNearbyFeatures,
  checkRegionAccess,
  getFeaturesByRegion
};
