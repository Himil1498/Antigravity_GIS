const express = require("express");
const router = express.Router();
const folderController = require("./controllers/folder.controller");
const fileController = require("./controllers/file.controller");
const catalogController = require("./controllers/catalog.controller");
const exportController = require("./controllers/export.controller");
const {
  authenticate,
  authorize,
  checkPermission,
} = require("../../shared/middleware/auth");

console.log("Network Planning Routes Loaded");

// All routes are protected
router.use(authenticate);

// POST /api/network-planning/export-combined
router.post("/export-combined", exportController.exportCombinedData);

// GET /api/network-planning/catalog
router.get("/catalog", catalogController.getUnifiedCatalog);

// GET /api/network-planning/global-search
router.get("/global-search", (req, res, next) => {
  catalogController.searchGlobalFeatures(req, res, next);
});

// GET /api/network-planning/pop-states  (State/UT folders under POP)
router.get("/pop-states", catalogController.getPopStateFolders);

// GET /api/network-planning/pops?folderId=123
router.get("/pops", catalogController.getPopList);

// GET /api/network-planning/infra-types  (POP, Sub POP, Node, Bandwidth BTS, etc.)
router.get("/infra-types", catalogController.getInfraTypeFolders);

// GET /api/network-planning/infra-states?typeId=123  (State/UT folders under a type)
router.get("/infra-states", catalogController.getInfraStateFolders);

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure Multer Storage
const uploadDir = path.join(__dirname, "../../uploads/network-planning");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // timestamp_filename.kml
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".kml" || ext === ".kmz") {
      cb(null, true);
    } else {
      cb(new Error("Only KML and KMZ files are allowed"));
    }
  },
});

// GET /api/network-planning/folders/tree
router.get("/folders/tree", folderController.getWorkspaceTree);

// GET /api/network-planning/folders
router.get("/folders", folderController.getFolderContents);

// POST /api/network-planning/folders
router.post("/folders", folderController.createFolder);

// DELETE /api/network-planning/folders/:id
router.delete(
  "/folders/:id",
  checkPermission("network:folder:delete"),
  folderController.deleteFolder,
);

// PUT /api/network-planning/folders/:id/rename
router.put(
  "/folders/:id/rename",
  checkPermission("network:folder:rename"),
  folderController.renameFolder,
);

// POST /api/network-planning/folders/:folderId/files - Upload Files
router.post(
  "/folders/:folderId/files",
  upload.array("files", 10),
  fileController.uploadFiles,
);

// GET /api/network-planning/all-files
router.get("/all-files", fileController.getAllFiles);

// GET /api/network-planning/files/:fileId/features (Data Grid)
router.get("/files/:fileId/features", fileController.getFileFeatures);

// GET /api/network-planning/files/:fileId
router.get("/files/:fileId", fileController.getFile);

// DELETE /api/network-planning/files/:fileId
router.delete("/files/:fileId", fileController.deleteFile);

// GET /api/network-planning/tiles/:z/:x/:y - Vector Tiles
router.get("/tiles/:z/:x/:y", catalogController.getVectorTiles);

// GET /api/network-planning/stats
router.get("/stats", catalogController.getMapStats);

// GET /api/network-planning/planned-count
router.get("/planned-count", catalogController.getPlannedCount);

// POST /api/network-planning/manual-feature (Add New Inventory)
router.post("/manual-feature", catalogController.addManualFeature);

// ============================================================
// Infrastructure Approval Workflow
// ============================================================
const infraApprovalController = require("./controllers/infra-approval.controller");

router.post("/infra-approvals", infraApprovalController.submit);
router.get("/infra-approvals/my-submissions", infraApprovalController.listMySubmissions);
router.get("/infra-approvals/history", infraApprovalController.listHistory);
router.get("/infra-approvals", infraApprovalController.listPending);
router.get("/infra-approvals/:id", infraApprovalController.getById);
router.put("/infra-approvals/:id/approve", infraApprovalController.approve);
router.put("/infra-approvals/:id/reject", infraApprovalController.reject);
router.put("/infra-approvals/:id/circuit", infraApprovalController.addCircuitId);
router.put("/infra-approvals/:id/resubmit", infraApprovalController.resubmit);
router.put("/infra-approvals/:id/edit", infraApprovalController.editSubmission);
router.delete("/infra-approvals/:id", infraApprovalController.deleteSubmission);

// ============================================================
// Feature CRUD Operations (Edit/Delete)
// ============================================================

// GET /api/network-planning/features/:featureId
router.get("/features/:featureId", catalogController.getFeature);

// PUT /api/network-planning/features/:featureId (Update)
router.put("/features/:featureId", catalogController.updateFeature);

// DELETE /api/network-planning/features/:featureId (Soft Delete)
router.delete("/features/:featureId", catalogController.deleteFeature);

// ============================================================
// Recycle Bin Operations
// ============================================================

// GET /api/network-planning/recycle-bin
router.get("/recycle-bin", catalogController.getRecycleBin);

// POST /api/network-planning/recycle-bin/:featureId/restore
router.post(
  "/recycle-bin/:featureId/restore",
  catalogController.restoreFeature,
);

// DELETE /api/network-planning/recycle-bin/empty (Bulk Delete All)
router.delete(
  "/recycle-bin/empty",
  checkPermission("network:recycle:delete"),
  catalogController.emptyRecycleBin,
);

// DELETE /api/network-planning/recycle-bin/delete-by-date (Bulk Delete by Date)
router.delete(
  "/recycle-bin/delete-by-date",
  checkPermission("network:recycle:delete"),
  catalogController.deleteRecycleBinByDate,
);

// DELETE /api/network-planning/recycle-bin/:featureId (Permanent Delete)
router.delete(
  "/recycle-bin/:featureId",
  catalogController.permanentDeleteFeature,
);

// ============================================================
// Auto Feasibility Checker
// ============================================================
const feasibilityRoutes = require('./routes/feasibility.routes');
router.use('/feasibility', feasibilityRoutes);
module.exports = router;
