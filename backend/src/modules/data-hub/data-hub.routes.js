const express = require("express");
const router = express.Router();
const {
  authenticate,
  checkPermission,
} = require("../../shared/middleware/auth");
const {
  cacheMiddleware,
  clearCacheOnMutation,
} = require("../../shared/middleware/cache");
const dataHubController = require("./controllers/data-hub.controller");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);
router.use(checkPermission("datahub:view"));

// Data retrieval (Cached)
router.get("/all", cacheMiddleware(60), dataHubController.getAllData);

// Import/Export
router.post("/import", upload.single("file"), dataHubController.importData);
// router.get("/imports", dataHubController.getImportHistory);
router.post("/export", dataHubController.exportData);
router.get("/template/:type", dataHubController.downloadTemplate);

// Data Management
router.delete(
  "/delete/:type/:id",
  clearCacheOnMutation(["/api/datahub", "/api/datahub/all"]),
  dataHubController.deleteSingleData,
);
router.delete(
  "/delete-bulk/:type",
  clearCacheOnMutation(["/api/datahub", "/api/datahub/all"]),
  dataHubController.deleteBulkData,
);

module.exports = router;
