/**
 * Cleanup Temporary Access Controller
 * Handles cleanup of expired temporary access
 */

const { cleanupExpiredTemporaryAccess } = require('../../../shared/utils/temporaryAccessCleanup');
const { ERRORS } = require('../constants');

/**
 * @route   POST /api/temporary-access/cleanup
 * @desc    Manually trigger cleanup of expired temporary access (Admin only)
 * @access  Private (Admin)
 */
const cleanupExpired = async (req, res) => {
  try {
    // Permission check is now handled by middleware (checkPermission('admin:temp_access'))


    const result = await cleanupExpiredTemporaryAccess();

    res.json({
      success: true,
      message: `Cleanup complete: Removed ${result.cleanedCount} expired temporary access grant(s)`,
      ...result
    });
  } catch (error) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({ success: false, error: ERRORS.CLEANUP_FAILED });
  }
};

module.exports = { cleanupExpired };
