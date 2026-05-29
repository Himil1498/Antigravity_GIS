const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const readController = require('./controllers/read.controller');
const writeController = require('./controllers/write.controller');
const actionController = require('./controllers/action.controller');

router.use(authenticate);

router.get('/', readController.getAllLayers);
router.get('/:id', readController.getLayerById);
router.post('/', writeController.createLayer);
router.put('/:id', writeController.updateLayer);
router.delete('/:id', writeController.deleteLayer);
router.patch('/:id/visibility', actionController.toggleVisibility);
router.post('/:id/share', actionController.shareLayer);

module.exports = router;
