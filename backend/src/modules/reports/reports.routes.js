const express = require("express");
const router = express.Router();
const { authenticate, authorize, checkPermission } = require("../../shared/middleware/auth");
const reportController = require("./controllers/report.controller");

// All reports routes require authentication and specific permission
router.use(authenticate);
router.use(checkPermission("admin:export_reports"));

// Report endpoints - support ?format=json|csv|xlsx
router.get("/region-usage", reportController.getRegionUsageReport);
router.get("/user-activity", reportController.getUserActivityReport);
router.get("/access-denials", reportController.getAccessDenialsReport);
router.get("/audit-logs", reportController.getAuditLogsReport);
router.get("/region-requests", reportController.getRegionRequestsReport);
router.get("/zone-assignments", reportController.getZoneAssignmentsReport);
router.get("/comprehensive", reportController.getComprehensiveReport);
router.get("/network-data", reportController.getNetworkDataReport);

module.exports = router;
