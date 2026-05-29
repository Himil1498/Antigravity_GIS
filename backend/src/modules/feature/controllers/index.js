/**
 * Feature Module
 * Barrel export for all feature controllers
 */

const featureController = require('./featureController');

// Re-export all controller functions for backward compatibility
module.exports = {
  getAllFeatures: featureController.getAllFeatures,
  getFeatureById: featureController.getFeatureById,
  createFeature: featureController.createFeature,
  updateFeature: featureController.updateFeature,
  deleteFeature: featureController.deleteFeature,
  getNearbyFeatures: featureController.getNearbyFeatures,
  getFeaturesByRegion: featureController.getFeaturesByRegion
};
