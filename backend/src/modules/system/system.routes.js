
const express = require('express');
const router = express.Router();
const schemaController = require('./controllers/schema.controller');
const apiController = require('./controllers/api.controller');
const { authenticate, checkPermission } = require('../../shared/middleware/auth');

// Routes
router.get(
  '/schema', 
  authenticate, 
  checkPermission('system:schema:view'), 
  schemaController.getDatabaseSchema
);

router.post(
  '/schema/query', 
  authenticate,
  checkPermission('system:schema:query'), 
  schemaController.executeReadOnlyQuery
);

router.post(
  '/schema/annotate',
  authenticate,
  checkPermission('system:schema:annotate'),
  schemaController.updateTableAnnotation
);

// API Documentation
router.get(
    '/api-docs',
    authenticate,
    checkPermission('system:api:view'),
    apiController.getApiDocs
);

router.post(
    '/api-docs/update',
    authenticate,
    checkPermission('system:api:edit'),
    apiController.updateApiAnnotation
);

module.exports = router;
