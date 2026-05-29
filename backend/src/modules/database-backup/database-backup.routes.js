const express = require("express");
const router = express.Router();
const { authenticate } = require("../../shared/middleware/auth");
const { checkPermission } = require("../../shared/middleware/checkPermission"); // Assuming this exists or using admin check
const databaseBackupController = require("./controllers/database-backup.controller");

const tableInfoController = require("./controllers/table-info.controller");

// Middleware
router.use(authenticate);
// Assuming most backup operations require admin or devtools permissions
// Using 'devtools.run' or similar if granular, or checking role in controller if legacy did so.
// Legacy explicitly used createBackup (Admin), getBackups (Admin) etc.
// checkPermission('devtools.run') was used in legacy routes.

// Test route to verify mounting
router.get("/test", (req, res) =>
  res.json({ success: true, message: "Backup subsystem online" }),
);

// Schema Discovery
router.get(
  "/tables",
  checkPermission("admin:database:export"),
  tableInfoController.getDatabaseSchema
);

// Backup Operations
// Backup Operations
router.post(
  "/create",
  checkPermission("admin:database"),
  databaseBackupController.createBackup
);

router.get(
  "/list",
  checkPermission("admin:database"),
  databaseBackupController.getBackups
);

router.get(
  "/:backupId/download",
  checkPermission("admin:database"),
  databaseBackupController.downloadBackup
);

router.delete(
  "/:backupId",
  checkPermission("admin:database"),
  databaseBackupController.deleteBackup
);


module.exports = router;
