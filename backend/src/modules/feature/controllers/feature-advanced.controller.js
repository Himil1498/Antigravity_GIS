/**
 * Feature Controller - Advanced Operations
 * Nearby and region-based feature operations
 */

const { ERRORS, MESSAGES } = require('../constants');
const {
  getNearbyFeatures: fetchNearbyFeatures,
  getFeaturesByRegion: fetchFeaturesByRegion
} = require('../services/feature-advanced.service');

/**
 * @route   GET /api/features/nearby
 * @desc    Get nearby features (with lat/lng/radius query params)
 * @access  Private
 */
const getNearbyFeatures = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, radius = DEFAULT_RADIUS } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: ERRORS.LAT_LNG_REQUIRED
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusMeters = parseFloat(radius);

    const features = await fetchNearbyFeatures(userId, lat, lng, radiusMeters);

    res.json({ success: true, features, count: features.length });
  } catch (error) {
    console.error('Get nearby features error:', error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_GET_NEARBY });
  }
};

/**
 * @route   GET /api/features/region/:regionId
 * @desc    Get features by region
 * @access  Private
 */
const getFeaturesByRegion = async (req, res) => {
  try {
    const { regionId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this region
    const hasAccess = await checkRegionAccess(userId, regionId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: ERRORS.NO_REGION_ACCESS
      });
    }

    const features = await fetchFeaturesByRegion(regionId);

    res.json({ success: true, features });
  } catch (error) {
    console.error('Get features by region error:', error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_GET_BY_REGION });
  }
};

module.exports = {
  getNearbyFeatures,
  getFeaturesByRegion
};
