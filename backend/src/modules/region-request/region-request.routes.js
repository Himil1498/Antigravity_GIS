const express = require('express');
const router = express.Router();
const { authenticate, checkPermission } = require('../../shared/middleware/auth');
const {
  createRequest,
  getRequests,
  deleteRequest,
  approveRequest,
  rejectRequest
} = require('./region-request.controller');

router.use(authenticate);

// User routes
router.get('/', getRequests);
router.post('/', createRequest);
router.delete('/:id', deleteRequest);

// Manager/Admin routes
router.patch('/:id/approve', checkPermission(['admin:region_requests', 'admin:region_request']), approveRequest);
router.patch('/:id/reject', checkPermission(['admin:region_requests', 'admin:region_request']), rejectRequest);

module.exports = router;
