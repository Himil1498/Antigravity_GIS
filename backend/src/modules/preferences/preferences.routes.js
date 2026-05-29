const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const preferencesController = require('./controllers/preferences.controller');

router.use(authenticate);

// Get preferences
router.get('/', preferencesController.getUserPreferences);

// Update preferences (Support both POST and PUT for compatibility)
router.post('/', preferencesController.saveUserPreferences);
router.put('/', preferencesController.saveUserPreferences);

// Reset preferences
router.delete('/', preferencesController.resetUserPreferences);

module.exports = router;
