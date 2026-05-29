const express = require("express");
const router = express.Router();

// Import from split user controllers
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("./controllers");

const {
  activateUser,
  deactivateUser,
} = require("./controllers/status.controller");

const {
  getUserRegions,
  assignRegion,
  unassignRegion,
} = require("./controllers/region.controller");

const {
  bulkDeleteUsers,
  bulkUpdateStatus,
  bulkAssignRegions,
} = require("./controllers/bulk");

const {
  resetPassword,
  resendVerificationEmail,
  manualVerifyEmail,
} = require("./controllers/email.controller");

const {
  getUserSessionStats,
  forceLogoutUser,
  sendAdminMessage,
  getUserRecentActivity,
} = require("./controllers/session");

const {
  createUserValidator,
  updateUserValidator,
} = require("./user.validator");
const validateRequest = require("../../shared/middleware/validateRequest");
const {
  authenticate,
  authorize,
  checkPermission,
} = require("../../shared/middleware/auth");

const {
  getPermissionCatalog,
  getUserPermissions,
  updateUserPermissions,
  getUserFolderAccess,
  assignFolderAccess,
  getUserFolderAddAccess,
  assignFolderAddAccess,
} = require("./user.permissions.controller");

// All routes require authentication
router.use(authenticate);

// GET /api/users/permissions/catalog - Get system permission catalog (Must be before /:id)
router.get(
  "/permissions/catalog",
  checkPermission("users:view"), // Allow anyone with users:view to see catalog (needed for UI)
  getPermissionCatalog,
);

// GET /api/users/:id/permissions - Get user permissions
router.get(
  "/:id/permissions",
  checkPermission("users:view"), // Allow viewing permissions if you can view users
  getUserPermissions,
);

// PUT /api/users/:id/permissions - Update user permissions
router.put(
  "/:id/permissions",
  checkPermission("users:edit"), // Allow editing if users:edit permission exists
  updateUserPermissions,
);

// GET /api/users/:id/folders - Get user folder access
router.get(
  "/:id/folders",
  checkPermission("users:view"), // Allow viewing folder access
  getUserFolderAccess,
);

// POST /api/users/:id/folders - Assign/Revoke folder access
router.post(
  "/:id/folders",
  checkPermission("users:edit"), // Allow managing folders if users:edit permission exists
  assignFolderAccess,
);

// GET /api/users/:id/folders/add - Get user folder add access
router.get(
  "/:id/folders/add",
  checkPermission("users:view"),
  getUserFolderAddAccess,
);

// POST /api/users/:id/folders/add - Assign/Revoke folder add access
router.post(
  "/:id/folders/add",
  checkPermission("users:edit"),
  assignFolderAddAccess,
);

// GET /api/users - Get all users
router.get("/", checkPermission("users:view"), getAllUsers);

// GET /api/users/:id - Get user by ID
router.get("/:id", getUserById);

// POST /api/users -// Create new user (Admin)
router.post(
  "/",
  authenticate,
  checkPermission("users:create"),
  createUserValidator,
  validateRequest,
  createUser,
);

// PUT /api/users/:id - Update user
router.put(
  "/:id",
  authenticate,
  checkPermission("users:edit"),
  updateUserValidator,
  validateRequest,
  updateUser,
);

// DELETE /api/users/bulk-delete - Bulk delete users (must be BEFORE /:id route)
router.delete(
  "/bulk-delete",
  checkPermission("users:delete"),
  bulkDeleteUsers,
);

// PATCH /api/users/bulk-status - Bulk update user status (must be BEFORE /:id route)
router.patch(
  "/bulk-status",
  checkPermission("users:edit"),
  bulkUpdateStatus,
);

// POST /api/users/bulk-assign-regions - Bulk assign regions to users (must be BEFORE /:id route)
router.post(
  "/bulk-assign-regions",
  checkPermission("admin:bulk_assignment"),
  bulkAssignRegions,
);

// POST /api/admin/send-message - Send message from admin to user
router.post(
  "/admin/send-message",
  checkPermission("users:manage_security"),
  sendAdminMessage,
);

// DELETE /api/users/:id - Delete user
router.delete("/:id", checkPermission("users:delete"), deleteUser);

// PATCH /api/users/:id/activate - Activate user
router.patch("/:id/activate", checkPermission("users:manage_security"), activateUser);

// PATCH /api/users/:id/deactivate - Deactivate user
router.patch(
  "/:id/deactivate",
  checkPermission("users:manage_security"),
  deactivateUser,
);

// POST /api/users/:id/reset-password - Reset user password
router.post(
  "/:id/reset-password",
  checkPermission(["users:reset_password", "admin:password_reset"]),
  resetPassword,
);

// PATCH /api/users/:id/verify-email-manual - Manually verify user's email (Admin only)
router.post(
  "/:id/verify-email-manual",
  checkPermission("users:manage_security"),
  manualVerifyEmail,
);

// POST /api/users/:id/resend-verification - Resend verification email (Admin only)
router.post(
  "/:id/resend-verification",
  checkPermission("users:manage_security"),
  resendVerificationEmail,
);

// GET /api/users/:id/regions - Get user regions
router.get("/:id/regions", getUserRegions);

// POST /api/users/:id/regions - Assign region
router.post("/:id/regions", checkPermission("users:assign_regions"), assignRegion);

// DELETE /api/users/:id/regions/:regionId - Unassign region
router.delete(
  "/:id/regions/:regionId",
  checkPermission("users:assign_regions"),
  unassignRegion,
);

// GET /api/users/:id/session-stats - Get user session statistics
router.get(
  "/:id/session-stats",
  checkPermission("users:view"),
  getUserSessionStats,
);

// POST /api/users/:id/force-logout - Force logout user (Admin only)
router.post(
  "/:id/force-logout",
  checkPermission("users:manage_security"),
  forceLogoutUser,
);

// GET /api/users/:id/recent-activity - Get user recent activity
router.get(
  "/:id/recent-activity",
  checkPermission("users:view"),
  getUserRecentActivity,
);

module.exports = router;
