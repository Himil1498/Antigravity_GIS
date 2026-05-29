/**
 * Layer Management Module
 * Barrel export for layer management controllers
 */

const readController = require('./readController');
const writeController = require('./writeController');
const actionController = require('./actionController');

module.exports = {
  // Read operations
  getAllLayers: readController.getAllLayers,
  getLayerById: readController.getLayerById,
  
  // Write operations
  createLayer: writeController.createLayer,
  updateLayer: writeController.updateLayer,
  deleteLayer: writeController.deleteLayer,
  
  // Action operations
  toggleVisibility: actionController.toggleVisibility,
  shareLayer: actionController.shareLayer
};
