
/**
 * Building Cache Service
 * Business logic for building cache operations
 */

const { pool } = require('../../../config/database');
const { CACHE_TABLES, CACHE } = require('../constants');
const { compressData, decompressData } = require('../../../shared/utils/compression');

/**
 * Check if cache entry exists
 * @param {string} cacheKey - Cache key
 * @returns {Promise<Object|null>} Existing cache entry or null
 */
const findExistingCache = async (cacheKey) => {
  const [existing] = await pool.query(
    'SELECT id FROM building_cache WHERE cache_key = ?',
    [cacheKey]
  );
  return existing.length > 0 ? existing[0] : null;
};

/**
 * Save or update cache entry
 * @param {Object} cacheData - Cache data
 * @returns {Promise<Object>} Result object with updated flag
 */
const saveCache = async (cacheData) => {
  const {
    cacheKey,
    bbox,
    buildingData,
    obstacleData,
    statistics
  } = cacheData;

  const existing = await findExistingCache(cacheKey);

  if (existing) {
    // Update existing cache
    await pool.query(
      `UPDATE building_cache
       SET building_data = ?,
           obstacle_data = ?,
           building_count = ?,
           buildings_with_height = ?,
           confidence_score = ?,
           last_accessed = CURRENT_TIMESTAMP,
           access_count = access_count + 1,
           expires_at = CURRENT_TIMESTAMP + (? || ' days')::interval
       WHERE cache_key = ?`,
      [
        JSON.stringify(buildingData),
        JSON.stringify(obstacleData),
        statistics.buildingCount,
        statistics.buildingsWithHeight,
        statistics.confidenceScore,
        CACHE.EXPIRY_DAYS,
        cacheKey
      ]
    );

    return { updated: true };
  }

  // Insert new cache entry
  await pool.query(
    `INSERT INTO building_cache
     (cache_key, bbox_south, bbox_north, bbox_west, bbox_east,
      building_data, obstacle_data, building_count, buildings_with_height,
      confidence_score, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP + (? || ' days')::interval)`,
    [
      cacheKey,
      bbox.south,
      bbox.north,
      bbox.west,
      bbox.east,
      JSON.stringify(buildingData),
      JSON.stringify(obstacleData),
      statistics.buildingCount,
      statistics.buildingsWithHeight,
      statistics.confidenceScore,
      CACHE.EXPIRY_DAYS
    ]
  );

  return { updated: false };
};

/**
 * Get cache by key
 * @param {string} cacheKey - Cache key
 * @returns {Promise<Object|null>} Cache entry or null
 */
const getCacheByKey = async (cacheKey) => {
  const [cached] = await pool.query(
    `SELECT building_data, obstacle_data, building_count,
            buildings_with_height, confidence_score, created_at
     FROM building_cache
     WHERE cache_key = ? AND expires_at > CURRENT_TIMESTAMP`,
    [cacheKey]
  );

  return cached.length > 0 ? cached[0] : null;
};

/**
 * Update cache access statistics
 * @param {string} cacheKey - Cache key
 * @returns {Promise<void>}
 */
const updateAccessStatistics = async (cacheKey) => {
  await pool.query(
    `UPDATE building_cache
     SET last_accessed = CURRENT_TIMESTAMP,
         access_count = access_count + 1
     WHERE cache_key = ?`,
    [cacheKey]
  );
};

/**
 * Query cache by bounding box
 * @param {Object} bbox - Bounding box
 * @returns {Promise<Object|null>} Cache entry or null
 */
const queryCacheByBbox = async (bbox) => {
  const [cached] = await pool.query(
    `SELECT cache_key, building_data, obstacle_data,
            building_count, buildings_with_height, confidence_score,
            created_at, access_count
     FROM building_cache
     WHERE bbox_south <= ? AND bbox_north >= ?
     AND bbox_west <= ? AND bbox_east >= ?
     AND expires_at > CURRENT_TIMESTAMP
     ORDER BY confidence_score DESC
     LIMIT 1`,
    [bbox.north, bbox.south, bbox.east, bbox.west]
  );

  return cached.length > 0 ? cached[0] : null;
};

/**
 * Cleanup expired cache entries
 * @returns {Promise<number>} Number of deleted entries
 */
const cleanupExpiredCache = async () => {
  const [result] = await pool.query(
    'DELETE FROM building_cache WHERE expires_at < CURRENT_TIMESTAMP'
  );
  return result.affectedRows;
};

/**
 * Get cache statistics
 * @returns {Promise<Object>} Statistics object
 */
const getCacheStatistics = async () => {
  const [stats] = await pool.query(`
    SELECT
      COUNT(*) as total_entries,
      SUM(building_count) as total_buildings,
      SUM(access_count) as total_accesses,
      AVG(confidence_score) as avg_confidence,
      COUNT(CASE WHEN expires_at < CURRENT_TIMESTAMP THEN 1 END) as expired_entries,
      COUNT(CASE WHEN expires_at >= CURRENT_TIMESTAMP THEN 1 END) as valid_entries
    FROM building_cache
  `);

  return stats[0];
};

module.exports = {
  saveCache,
  getCacheByKey,
  updateAccessStatistics,
  queryCacheByBbox,
  cleanupExpiredCache,
  getCacheStatistics
};
