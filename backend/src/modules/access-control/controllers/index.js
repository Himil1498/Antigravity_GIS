/**
 * Temporary Access Module
 * Barrel export for temporary access controllers
 */

const grantController = require('./grantController');
const revokeController = require('./revokeController');
const readController = require('./readController');
const cleanupController = require('./cleanupController');

module.exports = {
  getAllTemporaryAccess: readController.getAllTemporaryAccess,
  grantTemporaryAccess: grantController.grantTemporaryAccess,
  revokeTemporaryAccess: revokeController.revokeTemporaryAccess,
  getMyTemporaryAccess: readController.getMyTemporaryAccess,
  getCurrentValidRegions: readController.getCurrentValidRegions,
  cleanupExpired: cleanupController.cleanupExpired
};
