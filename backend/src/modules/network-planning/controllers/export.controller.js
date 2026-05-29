const exportService = require("../services/export.service");
const { logAudit } = require("../../audit/audit.service");
const { pool } = require("../../../config/database");

class ExportController {
  async exportCombinedData(req, res, next) {
    try {
      const {
        specificFolders,
        specificFiles,
        format,
        exportMode,
      } = req.body;
      const userId = req.user.id;

      // Permission Check
      // We check if user has 'network:tools:export' or if they are admin/manager
      // Relying on frontend permission gating + this check
      const userRole = req.user.role?.toLowerCase();
      const permissions = req.user.permissions || [];

      const hasPermission =
        userRole === "admin" ||
        userRole === "manager" ||
        (Array.isArray(permissions) &&
          permissions.includes("network:tools:export"));

      if (!hasPermission) {
        return res.status(403).json({
          error: "Access Denied: You need 'Export Data Tool' permission.",
        });
      }

      const result = await exportService.exportCombinedData({
        specificFolders,
        specificFiles,
        format: format || "kmz",
        exportMode: exportMode || "merged",
        userId,
        userRole,
      });

      // Try to fetch human readable names
      let exportedFileNames = [];
      let exportedFolderNames = [];
      try {
        if (specificFiles && specificFiles.length > 0) {
          const [fileRows] = await pool.query("SELECT name FROM network_files WHERE id = ANY($1::int[])", [specificFiles]);
          exportedFileNames = fileRows.map(r => r.name);
        }
        if (specificFolders && specificFolders.length > 0) {
          const [folderRows] = await pool.query("SELECT name FROM network_folders WHERE id = ANY($1::int[])", [specificFolders]);
          exportedFolderNames = folderRows.map(r => r.name);
        }
      } catch (e) {
        console.error("Failed to fetch export names:", e);
      }

      logAudit(
        userId,
        "Exported Network Planning Data",
        "DATA_EXPORTED",
        0, // 0 if root or multiple
        {
          format,
          exported_files: exportedFileNames.length > 0 ? exportedFileNames : specificFiles,
          exported_folders: exportedFolderNames.length > 0 ? exportedFolderNames : specificFolders,
        },
        req,
      ).catch((e) => console.error("Audit log failed", e));

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${result.filename}`,
      );
      res.setHeader("Content-Type", result.contentType);
      res.send(result.buffer);
    } catch (error) {
      if (error.message === "No data sources selected") {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
}

module.exports = new ExportController();
