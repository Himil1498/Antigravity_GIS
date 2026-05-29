const express = require("express");
const router = express.Router();
const updatesController = require("./updates.controller");
const { authenticate, authorize } = require("../../shared/middleware/auth");

/**
 * Public/User Routes
 */
// Public unauthenticated route for Login Page notice
router.get("/public", updatesController.getLatestPublicUpdate);

// All authenticated users can read published updates
router.get("/", authenticate, updatesController.getPublishedUpdates);

/**
 * Admin Routes
 */
// Verify admin access for management
router.use("/admin", authenticate, authorize("admin"));

router.get("/admin", updatesController.getAllUpdatesAdmin);
router.post("/admin", updatesController.createUpdate);
router.put("/admin/:id", updatesController.updateSystemUpdate);
router.delete("/admin/:id", updatesController.deleteUpdate);

module.exports = router;
