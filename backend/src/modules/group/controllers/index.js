/**
 * Group Permission Module
 * Barrel export for group permission and region controllers
 */

const permissionController = require('./groupPermissionController');
const regionController = require('./groupRegionController');

// Re-export all controller functions for backward compatibility
module.exports = {
  getGroupPermissions: permissionController.getGroupPermissions,
  updateGroupPermissions: permissionController.updateGroupPermissions,
  getGroupRegions: regionController.getGroupRegions,
  updateGroupRegions: regionController.updateGroupRegions
};
