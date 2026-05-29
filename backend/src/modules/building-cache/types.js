/**
 * Building Cache Types
 * JSDoc type definitions for request/response types
 */

/**
 * @typedef {Object} BoundingBox
 * @property {number} south - South latitude
 * @property {number} north - North latitude
 * @property {number} west - West longitude
 * @property {number} east - East longitude
 */

/**
 * @typedef {Object} SaveBuildingCacheRequest
 * @property {BoundingBox} bbox - Bounding box
 * @property {Object} building_data - Building data
 * @property {Object} [obstacle_data] - Optional obstacle data
 */

/**
 * @typedef {Object} SaveBuildingCacheResponse
 * @property {boolean} success
 * @property {string} message
 * @property {string} cacheKey
 * @property {Object} [statistics]
 * @property {boolean} [updated]
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} GetBuildingCacheResponse
 * @property {boolean} success
 * @property {boolean} cached
 * @property {Object} [data]
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} QueryBuildingCacheRequest
 * @property {BoundingBox} bbox - Bounding box to query
 */

/**
 * @typedef {Object} QueryBuildingCacheResponse
 * @property {boolean} success
 * @property {boolean} cached
 * @property {string} [message]
 * @property {string} [cacheKey]
 * @property {Object} [data]
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} CleanupExpiredCacheResponse
 * @property {boolean} success
 * @property {string} message
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} CacheStatisticsResponse
 * @property {boolean} success
 * @property {Object} statistics
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} CacheStatistics
 * @property {number} total_entries
 * @property {number} total_buildings
 * @property {number} total_accesses
 * @property {number} avg_confidence
 * @property {number} expired_entries
 * @property {number} valid_entries
 */

module.exports = {};
