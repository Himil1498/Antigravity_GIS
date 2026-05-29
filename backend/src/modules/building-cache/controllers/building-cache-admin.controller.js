/**
 * Building Cache Admin Controller
 * Handles admin-only building cache operations
 */

const { ERRORS, MESSAGES } = require('../constants');
const { pool } = require('../../../config/database');
const { CACHE_TABLES } = require('../constants');
const buildingCacheService = require('../services/building-cache.service');
const { logAudit } = require('../../audit/audit.service');

/**
 * @route   DELETE /api/building-cache/cleanup
 * @desc    Clean up expired cache entries
 * @access  Private (Admin only)
 */
const cleanupExpiredCacheEntries = async (req, res) => {
  try {
    const userRole = (req.user.role || '').toLowerCase();

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: ERRORS.ADMIN_REQUIRED
      });
    }

    const deletedCount = await cleanupExpiredCache();

    await logAudit(
      req.user.id,
      'CLEANUP_BUILDING_CACHE',
      'BUILDING_CACHE',
      'all',
      { deletedCount },
      req
    );

    res.json({
      success: true,
      message: MESSAGES.CLEANUP_SUCCESS.replace('{count}', deletedCount)
    });
  } catch (error) {
    console.error('Cleanup cache error:', error);
    res.status(500).json({
      success: false,
      error: ERRORS.FAILED_TO_CLEANUP
    });
  }
};

/**
 * @route   GET /api/building-cache/admin/stats
 * @desc    Get cache statistics
 * @access  Private (Admin only)
 */
const getCacheStats = async (req, res) => {
  try {
    const userRole = (req.user.role || '').toLowerCase();

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: ERRORS.ADMIN_REQUIRED
      });
    }

    const statistics = await getCacheStatistics();

    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Get cache stats error:', error);
    res.status(500).json({
      success: false,
      error: ERRORS.FAILED_TO_GET_STATS
    });
  }
};

module.exports = {
  cleanupExpiredCache: cleanupExpiredCacheEntries,
  getCacheStatistics: getCacheStats
};
