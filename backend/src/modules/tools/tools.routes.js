const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  authenticate,
  checkPermission,
} = require("../../shared/middleware/auth");
const {
  downloadSample,
  convertExcelToKml,
} = require("./tools.controller");

// Set up memory storage for handling Excel file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// All routes here require authentication and converter permission
router.use(authenticate);
router.use(checkPermission("converter:excel_to_kml"));

// Endpoints
router.get("/sample", downloadSample);
router.post("/convert", upload.single("file"), convertExcelToKml);

module.exports = router;
