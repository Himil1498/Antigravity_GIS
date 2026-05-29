const express = require("express");
const router = express.Router();
const { authenticate, authorize, checkPermission } = require("../../shared/middleware/auth"); // Check authorize import
const {
  getAuditLogs,
  getAuditLogById,
  getUserActivity,
  createAuditLog,
  deleteAuditLog,
  clearAllAuditLogs,
} = require("./controllers/audit.controller");
const {
  validateCreateAuditLog,
  validatePagination,
  validateDays,
} = require("./audit.validator");

router.use(authenticate);

// General routes
router.get("/logs", checkPermission("admin:audit_logs"), validatePagination, getAuditLogs);
router.post("/logs", validateCreateAuditLog, createAuditLog);
router.get("/logs/:id", checkPermission("admin:audit_logs"), getAuditLogById);
router.get("/user/:userId", checkPermission("admin:audit_logs"), validateDays, validatePagination, getUserActivity);

// Admin only routes
router.delete(
  "/logs/:id",
  checkPermission("admin:audit_logs:delete"),
  deleteAuditLog,
);
// router.delete('/logs', checkPermission('admin:audit_logs:clear'), clearAllAuditLogs);
router.delete(
  "/logs",
  checkPermission(["admin:audit_logs:clear", "admin:audit_logs"]),
  clearAllAuditLogs,
);

module.exports = router;
