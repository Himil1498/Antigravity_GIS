/**
 * Building Cache Constants
 * Route paths and configuration constants
 */

module.exports = {
  // Route paths
  ROUTES: {
    CACHE: '/api/building-cache',
    QUERY: '/api/building-cache/query',
    CLEANUP: '/api/building-cache/cleanup',
    STATS: '/api/building-cache/admin/stats'
  },

  // Cache expiration
  CACHE: {
    EXPIRY_DAYS: 30
  },

  // Default values
  DEFAULTS: {
    PRECISION: 4 // Decimal places for bbox rounding
  },

  // Error Messages
  ERRORS: {
    BBOX_REQUIRED: 'Bounding box required',
    BUILDING_DATA_REQUIRED: 'Bounding box and building data required',
    CACHE_NOT_FOUND: 'Cache not found or expired',
    ADMIN_REQUIRED: 'Admin access required',
    FAILED_TO_SAVE: 'Failed to save cache',
    FAILED_TO_GET: 'Failed to get cache',
    FAILED_TO_QUERY: 'Failed to query cache',
    FAILED_TO_CLEANUP: 'Failed to cleanup cache',
    FAILED_TO_GET_STATS: 'Failed to get statistics'
  },

  // Success Messages
  MESSAGES: {
    CACHE_SAVED: 'Cache saved successfully',
    CACHE_UPDATED: 'Cache updated successfully',
    NO_CACHE_FOUND: 'No cache found for this area',
    CLEANUP_SUCCESS: 'Cleaned up {count} expired cache entries'
  }
};
