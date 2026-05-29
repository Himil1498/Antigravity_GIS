const express = require('express');
const router = express.Router();
const { authenticate, checkPermission } = require('../../../shared/middleware/auth');
const folderController = require('../controllers/darkFiberFolderController');

// All routes require authentication and view permission
router.use(authenticate);
router.use(checkPermission('darkfiber:view'));

router.get('/', folderController.getFolders);
router.post('/', folderController.createFolder);
router.put('/:id', folderController.updateFolder);
router.delete('/:id', folderController.deleteFolder);

router.get('/recycle-bin', folderController.getRecycleBin);
router.put('/restore/:type/:id', folderController.restoreItem);
router.delete('/permanent/:type/:id', folderController.permanentDelete);

module.exports = router;
