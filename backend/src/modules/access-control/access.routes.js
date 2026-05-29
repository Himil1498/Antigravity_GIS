const express = require('express');
const router = express.Router();
const { authenticate, checkPermission } = require('../../shared/middleware/auth');

const grantController = require('./controllers/grantController');
const revokeController = require('./controllers/revokeController');
const readController = require('./controllers/readController');
const cleanupController = require('./controllers/cleanupController');
const permissionController = require('./controllers/permission.controller');
const userPermissionController = require('./controllers/user-permission.controller');
const roleController = require('./controllers/role.controller');


// Routes for Temporary Access
router.post('/temporary-access', authenticate, checkPermission('admin:temp_access'), grantController.grantTemporaryAccess);
router.get('/temporary-access', authenticate, checkPermission('admin:temp_access'), readController.getAllTemporaryAccess);
router.get('/temporary-access/my-access', authenticate, readController.getMyTemporaryAccess);
router.get('/temporary-access/current-regions', authenticate, readController.getCurrentValidRegions);
router.delete('/temporary-access/:id', authenticate, checkPermission('admin:temp_access'), revokeController.revokeTemporaryAccess);
router.post('/temporary-access/cleanup', authenticate, checkPermission('admin:temp_access'), cleanupController.cleanupExpired);

// Permission Routes (Migrated from routes/permission.js and routes/userPermission.js)
// Assuming we want to mount this at /api/permissions and /api/user-permissions or consolidate?
// Let's expose them here relative to the mount point.
// If I mount this router at `/api`, I need the full paths.
// If I mount at `/api/access`, then `/api/access/temporary-access`.

// Let's create separate route files for cleaner structure, or one file mounted at `/api`.
// I'll create `access-control.routes.js` and mount it at `/api`.

// User Permissions
router.get('/user-permissions/users', authenticate, checkPermission('permissions.manage'), userPermissionController.getUsersWithPermissions);
router.get('/user-permissions/:userId', authenticate, checkPermission('permissions.view'), userPermissionController.getUserPermissions);
router.post('/user-permissions/:userId', authenticate, checkPermission('permissions.manage'), userPermissionController.addUserPermissions);
router.delete('/user-permissions/:userId/:permissionId', authenticate, checkPermission('permissions.manage'), userPermissionController.removeUserPermissions);

// System Permissions (CRUD)
router.get('/permissions', authenticate, checkPermission('permissions.view'), permissionController.getAllPermissions);
router.post('/permissions', authenticate, checkPermission('permissions.manage'), permissionController.createPermission);
router.put('/permissions/:id', authenticate, checkPermission('permissions.manage'), permissionController.updatePermission);
router.delete('/permissions/:id', authenticate, checkPermission('permissions.manage'), permissionController.deletePermission);

// Role Management (CRUD)
router.get('/roles', authenticate, roleController.getAllRoles);
router.get('/roles/:id', authenticate, roleController.getRoleById);
router.post('/roles', authenticate, checkPermission('permissions.manage'), roleController.createRole);
router.put('/roles/:id', authenticate, checkPermission('permissions.manage'), roleController.updateRole);
router.delete('/roles/:id', authenticate, checkPermission('permissions.manage'), roleController.deleteRole);

module.exports = router;
