const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const { checkPermission } = require('../../shared/middleware/checkPermission');
const securityController = require('./controllers/security.controller');
const historyController = require('./controllers/history.controller');

// All routes require authentication and admin permissions
router.use(authenticate);
router.use(checkPermission('settings.view'));

router.post('/scan', securityController.runSecurityScan);
router.get('/history', historyController.getScanHistory);
router.get('/scan/:scanId', historyController.getScanDetails);
router.delete('/scan/:scanId', historyController.deleteScanHistory);

module.exports = router;
