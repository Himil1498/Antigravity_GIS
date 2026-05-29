const express = require("express");
const router = express.Router();
const {
  authenticate,
  checkPermission,
} = require("../../shared/middleware/auth");
const {
  getDashboardAnalytics,
  getRegionAnalytics,
  getFeatureAnalytics,
  trackEvent,
  getSystemHealth,
  getPerformanceMetrics,
  getSystemOverview,
  getInfrastructureStats,
  getUsageTrends,
  getUserAnalytics,
  getUserStats,
  getRecentActivity,
  getRecentUploads,
  getFeasibilityAnalytics,
  getPeakUsageAnalytics,
  getErrorLogsAnalytics,
} = require("./controllers/analytics.controller");

const {
  validateTrackEvent,
  validateTimeRange,
  validateLimit,
} = require("./analytics.validator");

router.use(authenticate);
// We do NOT apply checkPermission("analytics:view") globally anymore.
// Basic dashboard routes are open to all authenticated users.
// Sensitive routes will have their own checkPermission middleware applied explicitly.

// Dashboard (Open to all authenticated users)
router.get("/dashboard", getDashboardAnalytics);
router.get("/users", checkPermission("analytics:view"), getUserAnalytics);
router.get("/regions", getRegionAnalytics);
router.get("/features", getFeatureAnalytics);

// Tracking
router.post("/track", validateTrackEvent, trackEvent);

// System & Performance (Open to all authenticated users so System Health Monitor works)
router.get("/performance", validateTimeRange, getPerformanceMetrics);
router.get("/usage-trends", validateTimeRange, getUsageTrends);
router.get("/system-health", getSystemHealth);
router.get("/system-overview", getSystemOverview);
router.get("/infrastructure-stats", getInfrastructureStats); 

// Activity (Restricted mostly, but basic activity can be viewed)
router.get("/recent-activity", validateLimit, getRecentActivity);
router.get("/user-stats", getUserStats);
router.get("/recent-uploads", getRecentUploads);

// Advanced Analytics
router.get("/feasibility", getFeasibilityAnalytics);
router.get("/peak-usage", getPeakUsageAnalytics);
router.get("/error-logs", validateLimit, getErrorLogsAnalytics);

module.exports = router;
