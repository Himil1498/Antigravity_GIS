const express = require('express');
const router = express.Router();
const { authenticate, authorize, checkPermission } = require('../../shared/middleware/auth');
const {
  getAllRegions,
  getRegionById,
  getChildRegions,
  getRegionHierarchy,
  getRegionUsers,
  createRegion,
  updateRegion,
  deleteRegion
} = require('./region.controller');

router.use(authenticate);

// Read routes
router.get('/', getAllRegions);
router.get('/hierarchy', getRegionHierarchy);
router.get('/:id', getRegionById);
router.get('/:id/children', getChildRegions);
router.get('/:id/users', authorize('manager', 'admin'), getRegionUsers);

// Write routes (Admin only)
router.post('/', checkPermission('admin:region_boundaries'), createRegion);
router.put('/:id', checkPermission('admin:region_boundaries'), updateRegion);
router.delete('/:id', checkPermission('admin:region_boundaries'), deleteRegion);

module.exports = router;
