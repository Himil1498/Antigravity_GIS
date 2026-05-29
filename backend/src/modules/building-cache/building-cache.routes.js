const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const buildingCacheController = require('./controllers/building-cache.controller');
const buildingCacheAdminController = require('./controllers/building-cache-admin.controller');
const {
  validateBbox,
  validateSaveCache,
  validateAdmin
} = require('../../shared/middleware/buildingCache/buildingCacheValidator'); // Ensure middleware is accessible or migrate it too

// All routes require authentication
router.use(authenticate);

// Cache management routes
router.post('/', validateSaveCache, buildingCacheController.saveBuildingCache);
router.get('/:cacheKey', buildingCacheController.getBuildingCache);
router.post('/query', validateBbox, buildingCacheController.queryBuildingCache);
router.delete('/cleanup', validateAdmin, buildingCacheAdminController.cleanupExpiredCache);
router.get('/admin/stats', validateAdmin, buildingCacheAdminController.getCacheStatistics);

module.exports = router;
