const express = require('express');
const router = express.Router();
const { authenticate, authorize, checkPermission } = require('../../shared/middleware/auth');
const {
  getRegionBoundary,
  getBoundaryHistory,
  getBoundaryChangeHistory,
  getDraftDetail,
  createOrUpdateDraft,
  publishDraft,
  discardDraft,
  unpublishBoundary,
  revertToVersion,
  deleteAllBoundaryData
} = require('./boundary-version.controller');

router.use(authenticate);

// READ
router.get('/:id/boundary', getRegionBoundary);
router.get('/:id/boundaries', checkPermission('admin:region_boundaries', ['manager']), getBoundaryHistory);
router.get('/:id/boundary-changes', checkPermission('admin:region_boundaries', ['manager']), getBoundaryChangeHistory);
router.get('/:id/boundary-version/draft', checkPermission('admin:region_boundaries', ['manager']), getDraftDetail);

// WRITE (Admin/Manager/Permission)
router.post('/:id/boundary-version/draft', checkPermission('admin:region_boundaries', ['manager']), createOrUpdateDraft);
router.post('/:id/boundary-version/draft/publish', checkPermission('admin:region_boundaries', ['manager']), publishDraft);
router.delete('/:id/boundary-version/draft', checkPermission('admin:region_boundaries', ['manager']), discardDraft);
router.put('/:id/boundary', checkPermission('admin:region_boundaries', ['manager']), publishDraft); // Direct publish/update

// WRITE (Admin Only or Permission)
router.delete('/:id/boundary', checkPermission('admin:region_boundaries'), unpublishBoundary);
router.delete('/:id/boundary-data', checkPermission('admin:region_boundaries'), deleteAllBoundaryData);
router.post('/:id/boundary/revert/:versionId', checkPermission('admin:region_boundaries'), revertToVersion);

module.exports = router;
