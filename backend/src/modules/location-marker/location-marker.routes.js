        const express = require('express');
const router = express.Router();
const locationMarkerController = require('./controllers/LocationMarkerController');
const { authenticate, checkPermission } = require('../../shared/middleware/auth');

// All routes require authentication
router.use(authenticate);

// We ensure users have basic map module access before managing markers
router.use(checkPermission('map:view'));

// Get all markers for current user
router.get('/', locationMarkerController.getAllMarkers);

// Create a new marker (requires tool permission)
router.post('/', checkPermission('network:feasibility:markers'), locationMarkerController.createMarker);

// Create bulk markers
router.post('/bulk', checkPermission('network:feasibility:markers'), locationMarkerController.createBulkMarkers);

// Update basic marker details (requires tool permission)
router.put('/:id', checkPermission('network:feasibility:markers'), locationMarkerController.updateMarker);

// Update feasibility survey data (requires feasibility edit permission)
router.put('/:id/feasibility', checkPermission('network:feasibility:edit'), locationMarkerController.updateFeasibility);

// Delete a marker (requires tool permission)
router.delete('/:id', checkPermission('network:feasibility:markers'), locationMarkerController.deleteMarker);

// Delete bulk markers
router.delete('/', checkPermission('network:feasibility:markers'), locationMarkerController.deleteBulkMarkers);

module.exports = router;
