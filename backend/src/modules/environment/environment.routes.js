const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const { checkPermission } = require('../../shared/middleware/checkPermission');
const environmentController = require('./controllers/environment.controller');

// All routes require authentication and admin permissions
router.use(authenticate);
router.use(checkPermission('settings.view'));

router.post('/validate', environmentController.validateEnvironment);
router.get('/history', environmentController.getValidationHistory);
router.get('/validation/:validationId', environmentController.getValidationDetails);
router.delete('/validation/:validationId', environmentController.deleteValidation);

module.exports = router;
