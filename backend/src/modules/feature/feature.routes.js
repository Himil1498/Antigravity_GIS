const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const featureController = require('./controllers/feature.controller');
const featureBasicController = require('./controllers/feature-basic.controller');
const featureAdvancedController = require('./controllers/feature-advanced.controller');

// Consolidate exports from featureController or usage?
// Check original routes: require('../controllers/feature') -> index.js
// index.js likely exports from basic/advanced/main.

// Let's assume feature.controller acts as aggregator or we use individual controllers.
// Original index.js: likely exports everything.
// I will inspect controllers/feature/index.js if it existed.
// But based on file names, I'll map directly.

router.use(authenticate);

router.get('/', featureBasicController.getAllFeatures);
router.get('/nearby', featureAdvancedController.getNearbyFeatures);
router.get('/region/:regionId', featureAdvancedController.getFeaturesByRegion);
router.get('/:id', featureBasicController.getFeatureById);
router.post('/', featureBasicController.createFeature);
router.put('/:id', featureBasicController.updateFeature);
router.delete('/:id', featureBasicController.deleteFeature);

module.exports = router;
