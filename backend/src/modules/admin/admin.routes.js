const express = require("express");
const router = express.Router();
const exportController = require("./export.controller");
const { authenticate } = require("../../shared/middleware/auth"); 
const { checkPermission } = require("../../shared/middleware/checkPermission");

// Check paths:
// auth.service is in ../auth/auth.service.js relative to admin module?
// admin is in src/modules/admin
// auth is in src/modules/auth -> ../auth/auth.service is correct.
// access-control is in src/modules/access-control -> ../access-control/... is correct.

/**
 * @route   GET /api/admin/export/database
 * @desc    Export database tables to Excel
 * @access  Private (data:export permission)
 */
router.get(
  "/export/database",
  authenticate,
  checkPermission("data:export"),
  exportController.exportDatabase
);

/**
 * @route   GET /api/admin/export/tables
 * @desc    Get list of all exportable database tables
 * @access  Private (data:export permission)
 */
router.get(
  "/export/tables",
  authenticate,
  checkPermission("data:export"),
  exportController.getExportableTables
);

module.exports = router;
