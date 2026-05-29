const express = require('express');
const router = express.Router();
const { authenticate, authorize, checkPermission } = require('../../shared/middleware/auth');
const {
  analyzeImpact,
  getInfrastructureHistory
} = require('./boundary-impact.controller');

router.use(authenticate);

// Analyze impact of draft boundary (Admin/Manager/Permission)
router.post(
  '/:id/boundary-version/draft/analyze-impact',
  checkPermission('admin:region_boundaries', ['manager']),
  analyzeImpact
);

// Get infrastructure history for region (Admin/Manager/Permission)
router.get(
  '/:id/infrastructure-history',
  checkPermission('admin:region_boundaries', ['manager']),
  getInfrastructureHistory
);

module.exports = router;
