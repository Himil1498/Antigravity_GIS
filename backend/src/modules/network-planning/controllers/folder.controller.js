const networkPlanningService = require("../services/folder.service");
const { logAudit } = require("../../audit/audit.service");
const { notifyRoles } = require("../../notification/services/notification.service");

class FolderController {
  async getFolderContents(req, res, next) {
    try {
      let parentId = null;
      if (req.query.path) {
        parentId = await networkPlanningService.getFolderIdByPath(req.query.path);
      } else {
        parentId =
          req.query.parentId === "root" || !req.query.parentId
             ? null
             : parseInt(req.query.parentId);
      }

      const { includeApprovedOutcomes, accessType } = req.query;
      const performFilter = includeApprovedOutcomes === "true";

      // Extract User Context
      const userId = req.user ? req.user.id : null;
      const role = req.user ? req.user.role : null;

      const contents = await networkPlanningService.getFolderContents(
        parentId,
        userId,
        role,
        performFilter,
        accessType
      );

      // If we are deep inside, get breadcrumbs too
      let breadcrumbs = [];
      if (parentId) {
        breadcrumbs = await networkPlanningService.getBreadcrumbs(parentId);
      }

      res.json({
        success: true,
        data: {
          ...contents,
          breadcrumbs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceTree(req, res, next) {
    try {
      const { includeApprovedOutcomes, accessType } = req.query;
      const performFilter = includeApprovedOutcomes === "true";

      const userId = req.user ? req.user.id : null;
      const role = req.user ? req.user.role : null;

      const contents = await networkPlanningService.getWorkspaceTree(
        userId,
        role,
        performFilter,
        accessType
      );

      res.json({
        success: true,
        data: contents,
      });
    } catch (error) {
      next(error);
    }
  }

  async createFolder(req, res, next) {
    try {
      const { name, parentId, defaultIcon } = req.body;
      const userId = req.user.id;

      if (!name) {
        return res.status(400).json({ error: "Folder name is required" });
      }

      const folder = await networkPlanningService.createFolder(
        name,
        parentId,
        userId,
        false, // isSystem (default user created)
        null, // category (auto-detect)
        defaultIcon, // Pass user icon
      );

      try {
        await logAudit(
          userId,
          "Created network planning folder",
          "FOLDER_CREATED",
          folder.id,
          { name, parentId },
          req,
        );
      } catch (e) {
        console.error("Audit log failed", e);
      }

      // Notify Admin & Developer roles about the new folder
      try {
        const userName = req.user.full_name || req.user.email || `User #${userId}`;
        const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        await notifyRoles(
          ["admin", "superadmin", "developer"],
          "network_folder",
          `New Folder Created: "${name}"`,
          `${userName} created a new folder "${name}" in Network Planning on ${now}.`,
          {
            related_entity_id: folder.id,
            related_entity_type: "network_folder",
          }
        );
      } catch (e) {
        console.error("Folder creation notification failed", e);
      }

      res.status(201).json({
        success: true,
        data: folder,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFolder(req, res, next) {
    try {
      const { id } = req.params;
      await networkPlanningService.deleteFolder(id);

      try {
        await logAudit(
          req.user.id,
          "Deleted network planning folder",
          "FOLDER_DELETED",
          id,
          { action: "DELETE" },
          req,
        );
      } catch (e) {
        console.error("Audit log failed", e);
      }

      res.json({
        success: true,
        message: "Folder deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async renameFolder(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const userId = req.user.id;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: "Folder name is required" });
      }

      const folder = await networkPlanningService.renameFolder(id, name);

      try {
        await logAudit(
          userId,
          `Renamed network folder to "${name.trim()}"`,
          "FOLDER_RENAMED",
          id,
          { oldName: folder.name, newName: name.trim() },
          req,
        );
      } catch (e) {
        console.error("Audit log failed", e);
      }

      res.json({
        success: true,
        data: folder,
      });
    } catch (error) {
      if (error.message.includes("Cannot rename") || error.message.includes("already exists")) {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }
}

module.exports = new FolderController();
