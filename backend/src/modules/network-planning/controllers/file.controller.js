const networkPlanningService = require("../services/file.service");
const { logAudit } = require("../../audit/audit.service");

class FileController {
  async getFile(req, res, next) {
    try {
      const file = await networkPlanningService.getFile(req.params.fileId);
      if (!file) {
        return res
          .status(404)
          .json({ success: false, message: "File not found" });
      }
      res.json({ success: true, data: file });
    } catch (error) {
      next(error);
    }
  }

  async getAllFiles(req, res, next) {
    try {
      const files = await networkPlanningService.getAllFiles(req.user.id, req.user.role);
      res.json({ success: true, data: files });
    } catch (error) {
      next(error);
    }
  }

  async uploadFiles(req, res, next) {
    try {
      const { folderId } = req.params;
      // ✅ Prioritize Query Param (Fixes Multer body parsing issues)
      const iconType = req.query.iconType || req.body.iconType;
      const files = req.files;
      const userId = req.user.id;
      console.log("📂 Upload Request Body:", req.body);
      console.log("📂 Upload Query:", req.query); // Debug log
      console.log(
        "📂 Upload Files:",
        req.files?.map((f) => f.originalname),
      );
      console.log("✅ Selected Icon Type:", iconType);

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedFiles = await networkPlanningService.uploadFiles(
        folderId,
        files,
        userId,
        iconType,
      );

      res.status(201).json({
        success: true,
        data: uploadedFiles,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req, res, next) {
    try {
      const { fileId } = req.params;
      const userRole = req.user.role ? req.user.role.toLowerCase() : "";
      const isAdminOrManager = userRole === "admin" || userRole === "manager";

      // 1. Fetch File to check its type/status
      const file = await networkPlanningService.getFile(fileId);
      if (!file) {
        return res.status(404).json({ success: false, message: "File not found" });
      }

      // 2. Permission Check for non-admins
      if (!isAdminOrManager) {
        let permissions = req.user.permissions;
        
        // If permissions not on req.user, fetch them
        if (!permissions) {
          const { pool } = require("../../../config/database");
          const [userRows] = await pool.query(
            "SELECT permissions FROM users WHERE id = $1",
            [req.user.id]
          );
          permissions = userRows && userRows.length > 0 ? userRows[0].permissions || [] : [];
        }

        // Ensure permissions is an array
        if (typeof permissions === 'string') {
          try { permissions = JSON.parse(permissions); } catch(e) { permissions = []; }
        }

        const statusStr = (file.properties?.status || file.metadata?.status || "").toLowerCase();
        const isPlanned = statusStr === "planned";
        const isActive = statusStr === "active";
        const isImported = file.metadata?.source === "import" || file.properties?.source === "import";

        let requiredPermission = "";
        let permName = "";

        if (isPlanned) {
          requiredPermission = "network:file:delete_file_planned";
          permName = "Delete Planned File";
        } else if (isActive) {
          requiredPermission = "network:file:delete_file_live";
          permName = "Delete Live File";
        } else if (isImported) {
          requiredPermission = "network:file:delete_file_imported";
          permName = "Delete Imported File";
        } else {
          requiredPermission = "network:file:delete_file_live";
          permName = "Delete Live File";
        }

        if (!Array.isArray(permissions) || !permissions.includes(requiredPermission)) {
          return res.status(403).json({
            success: false,
            message: `Access denied: You need the '${permName}' permission to delete this file.`,
          });
        }
      }

      await networkPlanningService.deleteFile(fileId, req.user.id);

      // ✅ Send response IMMEDIATELY to unblock UI
      res.json({
        success: true,
        message: "File deleted successfully",
      });

    } catch (error) {
      next(error);
    }
  }

  async getFileFeatures(req, res, next) {
    try {
      const { fileId } = req.params;
      const { page, limit, search, sortBy, sortOrder } = req.query;
      const result = await networkPlanningService.getFileFeatures(
        fileId,
        page,
        limit,
        search,
        sortBy,
        sortOrder
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FileController();
