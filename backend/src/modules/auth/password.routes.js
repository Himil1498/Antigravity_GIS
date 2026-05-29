const express = require("express");
const router = express.Router();

const {
  submitPasswordResetRequest,
  getAllPasswordResetRequests,
  getPasswordResetRequestById,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
  deletePasswordResetRequest,
  deleteAllPasswordResetRequests,
} = require("./controllers/password.controller");

const { authenticate, checkPermission } = require("../../shared/middleware/auth");

// Password Reset Routes
router.post("/", submitPasswordResetRequest);

// Admin Routes
router.get(
  "/",
  authenticate,
  checkPermission(["admin:password_requests", "admin:password_reset"]),
  getAllPasswordResetRequests,
);
router.get(
  "/:id",
  authenticate,
  checkPermission(["admin:password_requests", "admin:password_reset"]),
  getPasswordResetRequestById,
);
router.post(
  "/:id/approve",
  authenticate,
  checkPermission(["admin:password_requests", "admin:password_reset"]),
  approvePasswordResetRequest,
);
router.post(
  "/:id/reject",
  authenticate,
  checkPermission(["admin:password_requests", "admin:password_reset"]),
  rejectPasswordResetRequest,
);
router.delete(
  "/",
  authenticate,
  checkPermission(["admin:password_requests", "admin:password_reset"]),
  deleteAllPasswordResetRequests,
);

router.delete(
  "/:id",
  authenticate,
  checkPermission(["admin:password_requests", "admin:password_reset"]),
  deletePasswordResetRequest,
);

module.exports = router;
