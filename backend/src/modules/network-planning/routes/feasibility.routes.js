const express = require('express');
const router = express.Router();
const multer = require('multer');
const feasibilityController = require('../controllers/feasibility.controller');
const { authenticate } = require('../../../shared/middleware/auth');

// Store file in memory buffer for processing directly
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max limit
});

// Protect all routes
router.use(authenticate);

router.get('/infra-folders', feasibilityController.getInfraFolders);
router.post('/check', upload.single('file'), feasibilityController.checkBulkFeasibility);

module.exports = router;
