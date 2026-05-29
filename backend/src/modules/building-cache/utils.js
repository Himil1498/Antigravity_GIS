/**
 * Building Cache Utilities
 * Helper functions for building cache operations
 */

const crypto = require('crypto');
const { DEFAULTS } = require('./constants');

/**
 * Generate cache key from bounding box
 * Rounds to 4 decimal places (~11m precision) for better cache hits
 * @param {Object} bbox - Bounding box object
 * @returns {string} MD5 hash of rounded bbox
 */
const generateCacheKey = (bbox) => {
  const rounded = {
    south: bbox.south.toFixed(DEFAULTS.PRECISION),
    north: bbox.north.toFixed(DEFAULTS.PRECISION),
    west: bbox.west.toFixed(DEFAULTS.PRECISION),
    east: bbox.east.toFixed(DEFAULTS.PRECISION)
  };

  const str = `${rounded.south}_${rounded.north}_${rounded.west}_${rounded.east}`;

  // Create hash for shorter key
  return crypto.createHash('md5').update(str).digest('hex');
};

/**
 * Calculate cache statistics from building data
 * @param {Object} buildingData - Building data object
 * @returns {Object} Statistics object
 */
const calculateCacheStatistics = (buildingData) => {
  const buildings = buildingData.buildings || [];
  const buildingCount = buildings.length;
  const buildingsWithHeight = buildings.filter(b => !b.estimatedHeight).length;
  const confidenceScore = buildingData.coverage?.confidenceScore || 0;

  return {
    buildingCount,
    buildingsWithHeight,
    confidenceScore
  };
};

/**
 * Format cache response data
 * @param {Object} cached - Raw cached data from database
 * @returns {Object} Formatted cache data
 */
const formatCacheData = (cached) => ({
  building_data: cached.building_data,
  obstacle_data: cached.obstacle_data,
  statistics: {
    buildingCount: cached.building_count,
    buildingsWithHeight: cached.buildings_with_height,
    confidenceScore: cached.confidence_score,
    ...(cached.access_count !== undefined && { accessCount: cached.access_count })
  },
  cachedAt: cached.created_at
});

/**
 * Parse JSON from database (handles both string and object)
 * @param {string|Object} data - Data from database
 * @returns {Object|null} Parsed JSON object or null
 */
const parseJSON = (data) => {
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : data;
};

/**
 * Stringify data for database storage
 * @param {Object|null} data - Data to stringify
 * @returns {string|null} Stringified JSON or null
 */
const stringifyJSON = (data) => {
  return data ? JSON.stringify(data) : null;
};

module.exports = {
  generateCacheKey,
  calculateCacheStatistics,
  formatCacheData,
  parseJSON,
  stringifyJSON
};
