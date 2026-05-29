const networkPlanningService = require("../services/catalog.service");
const regionService = require("../../region/region.service");
const { logAudit } = require("../../audit/audit.service");

class CatalogController {
  async getUnifiedCatalog(req, res, next) {
    try {
      // Support both single regionId (legacy) and multi-region regionIds
      let regionIds = null;
      if (req.query.regionIds) {
        regionIds = req.query.regionIds
          .split(",")
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      } else if (req.query.regionId) {
        regionIds = [parseInt(req.query.regionId)];
      }

      const { includeApprovedOutcomes } = req.query;
      const performFilter = includeApprovedOutcomes === "true";

      const userRole = req.user.role ? req.user.role.toLowerCase() : "";
      const isAdmin =
        userRole === "admin" ||
        userRole === "manager" ||
        userRole === "developer";

      // Security: Enforce Region Boundaries for Non-Admins (Dynamic Counts)
      if (!isAdmin) {
        const allowedRegions = await regionService.getAllRegions(
          null,
          null,
          req.user.id,
          userRole,
        );
        const allowedIds = allowedRegions.map((r) => r.id);

        if (!regionIds || regionIds.length === 0) {
          // No filter selected -> Enforce ALL allowed regions for accurate counts
          regionIds = allowedIds;
        } else {
          // Filter selected -> Enforce intersection
          regionIds = regionIds.filter((id) => allowedIds.includes(id));
          if (regionIds.length === 0) {
            regionIds = allowedIds; // Fallback to allowed regions
          }
        }
      }

      const result = await networkPlanningService.getUnifiedCatalog(
        req.user.id,
        regionIds,
        performFilter,
        isAdmin,
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMapStats(req, res, next) {
    try {
      // Support both single regionId and multi-region regionIds
      let regionIds = null;
      if (req.query.regionIds) {
        regionIds = req.query.regionIds
          .split(",")
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      } else if (req.query.regionId) {
        regionIds = [parseInt(req.query.regionId)];
      }

      // Security: Enforce Region Boundaries for Non-Admins
      const userRole = req.user.role ? req.user.role.toLowerCase() : "";
      const isRestricted = !["admin", "manager"].includes(userRole);

      if (isRestricted) {
        const allowedRegions = await regionService.getAllRegions(
          null,
          null,
          req.user.id,
          userRole,
        );
        const allowedIds = allowedRegions.map((r) => r.id);

        if (!regionIds || regionIds.length === 0) {
          // No filter selected -> Enforce ALL allowed regions
          regionIds = allowedIds;
        } else {
          // Filter selected -> Enforce intersection
          regionIds = regionIds.filter((id) => allowedIds.includes(id));
          // If intersection is empty, user trying to access forbidden region
          if (regionIds.length === 0) {
            return res.json({
              success: true,
              data: { total: 0, byItemType: {}, byStatus: {} },
            });
          }
        }
      }

      let fileIds = null;
      if (req.query.fileIds) {
        fileIds = req.query.fileIds
          .split(",")
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      }

      const stats = await networkPlanningService.getMapStats(
        regionIds,
        fileIds,
      );
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getVectorTiles(req, res, next) {
    try {
      const { z, x, y } = req.params;
      const fileId = req.query.fileId ? parseInt(req.query.fileId) : null;

      // Support fileIds array for efficient server-side filtering
      let fileIds = null;
      if (req.query.fileIds) {
        fileIds = req.query.fileIds
          .split(",")
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      }

      // Support both single regionId (legacy) and multi-region regionIds
      let regionIds = null;
      if (req.query.regionIds) {
        regionIds = req.query.regionIds
          .split(",")
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      } else if (req.query.regionId) {
        regionIds = [parseInt(req.query.regionId)];
      }

      // Security: Enforce Region Boundaries for Non-Admins
      const userRole = req.user.role ? req.user.role.toLowerCase() : "";
      const isRestricted = !["admin", "manager"].includes(userRole);

      if (isRestricted) {
        const allowedRegions = await regionService.getAllRegions(
          null,
          null,
          req.user.id,
          userRole,
        );
        const allowedIds = allowedRegions.map((r) => r.id);

        if (!regionIds || regionIds.length === 0) {
          // No filter selected -> Enforce ALL allowed regions
          regionIds = allowedIds;
        } else {
          // Filter selected -> Enforce intersection
          regionIds = regionIds.filter((id) => allowedIds.includes(id));
          // If intersection is empty, user trying to access forbidden region
          if (regionIds.length === 0) {
            return res.status(204).send();
          }
        }
      }

      const tile = await networkPlanningService.getVectorTiles(
        parseInt(z),
        parseInt(x),
        parseInt(y),
        fileId,
        regionIds,
        fileIds, // Pass fileIds for server-side filtering
      );

      if (!tile || tile.length === 0) {
        return res.status(204).send();
      }

      res.setHeader("Content-Type", "application/x-protobuf");
      res.send(tile);
    } catch (error) {
      next(error);
    }
  }

  async getLayerExtent(req, res, next) {
    try {
      const { fileId } = req.params;
      const extent = await networkPlanningService.getLayerExtent(
        parseInt(fileId),
      );

      if (!extent || extent.xmin === null) {
        return res
          .status(404)
          .json({ success: false, message: "No extent found" });
      }

      res.json({ success: true, data: extent });
    } catch (error) {
      next(error);
    }
  }

  async addManualFeature(req, res) {
    try {
      const result = await networkPlanningService.addManualFeature(
        req.user.id,
        req.body,
      );
      res.json(result);

      // Audit Log: Add New Inventory
      logAudit(
        req.user.id,
        "Added infrastructure feature",
        "INFRASTRUCTURE_ADDED",
        result.id || 0,
        { type: req.body.geometry?.type, properties: req.body.properties },
        req,
      ).catch((e) => console.error("Audit log failed", e));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  // ============================================================
  // Feature CRUD Operations
  // ============================================================

  async getFeature(req, res, next) {
    try {
      const { featureId } = req.params;
      const feature = await networkPlanningService.getFeatureById(
        parseInt(featureId),
      );

      if (!feature) {
        return res
          .status(404)
          .json({ success: false, message: "Feature not found" });
      }

      res.json({ success: true, data: feature });
    } catch (error) {
      next(error);
    }
  }

  async updateFeature(req, res, next) {
    try {
      const { featureId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get feature to check permissions
      const existingFeature = await networkPlanningService.getFeatureById(
        parseInt(featureId),
      );

      if (!existingFeature) {
        return res
          .status(404)
          .json({ success: false, message: "Feature not found" });
      }

      // Permission check: Admin/Manager can edit any, others only their own
      const isAdminOrManager =
        userRole &&
        (userRole.toLowerCase() === "admin" ||
          userRole.toLowerCase() === "manager");
      const isOwner = existingFeature.created_by === userId;

      // Check explicit permission (Robust)
      let permissions = req.user.permissions || [];
      if (!permissions) {
        try {
          const { pool } = require("../../../config/database");
          const [userRows] = await pool.query(
            "SELECT permissions FROM users WHERE id = $1",
            [userId],
          );
          permissions =
            userRows && userRows.length > 0 ? userRows[0].permissions : [];
        } catch (e) {
          permissions = [];
        }
      }
      if (typeof permissions === "string") {
        try {
          permissions = JSON.parse(permissions);
        } catch (e) {
          permissions = [];
        }
      }

      const statusStr = (existingFeature.properties?.status || "").toLowerCase();
      const isPlanned = statusStr === "planned";
      const isActive = statusStr === "active";
      const isImported = existingFeature.properties?.source === "import";

      let hasGranularEditPermission = false;
      let requiredPermissionName = "";

      if (isPlanned) {
        hasGranularEditPermission = permissions.includes("network:file:edit_planned") || permissions.includes("network:file:live_edit_planned");
        requiredPermissionName = "Edit Planned Infrastructure Data";
      } else if (isActive) {
        hasGranularEditPermission = permissions.includes("network:file:edit_live") || permissions.includes("network:file:live_edit_live");
        requiredPermissionName = "Edit Live Inventory Data";
      } else if (isImported) {
        hasGranularEditPermission = permissions.includes("network:file:edit_imported") || permissions.includes("network:file:live_edit_imported");
        requiredPermissionName = "Edit Imported File Data";
      } else {
        hasGranularEditPermission = permissions.includes("network:file:edit_live") || permissions.includes("network:file:live_edit_live");
        requiredPermissionName = "Edit Live Inventory Data";
      }

      if (!isAdminOrManager && !isOwner && !hasGranularEditPermission) {
        return res.status(403).json({
          success: false,
          message: `You lack the '${requiredPermissionName}' permission to edit this feature.`,
        });
      }

      const updatedFeature = await networkPlanningService.updateManualFeature(
        parseInt(featureId),
        userId,
        req.body,
      );

      res.json({ success: true, data: updatedFeature });

      // Audit Log: Edit Feature
      logAudit(
        userId,
        "Edited network feature",
        "INFRASTRUCTURE_UPDATED",
        parseInt(featureId),
        { changes: Object.keys(req.body) },
        req,
      ).catch((e) => console.error("Audit log failed", e));
    } catch (error) {
      next(error);
    }
  }

  async deleteFeature(req, res, next) {
    try {
      const { featureId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get feature to check permissions
      const existingFeature = await networkPlanningService.getFeatureById(
        parseInt(featureId),
      );

      if (!existingFeature) {
        return res
          .status(404)
          .json({ success: false, message: "Feature not found" });
      }

      // Permission check: Admin/Manager can delete any, others only their own
      const isAdminOrManager =
        userRole &&
        (userRole.toLowerCase() === "admin" ||
          userRole.toLowerCase() === "manager");
      const isOwner = existingFeature.created_by === userId;

      // Check explicit permission (Robust)
      let permissions = req.user.permissions || [];
      if (!permissions) {
        try {
          const { pool } = require("../../../config/database");
          const [userRows] = await pool.query(
            "SELECT permissions FROM users WHERE id = $1",
            [userId],
          );
          permissions =
            userRows && userRows.length > 0 ? userRows[0].permissions : [];
        } catch (e) {
          permissions = [];
        }
      }
      if (typeof permissions === "string") {
        try {
          permissions = JSON.parse(permissions);
        } catch (e) {
          permissions = [];
        }
      }

      const statusStr = (existingFeature.properties?.status || "").toLowerCase();
      const isPlanned = statusStr === "planned";
      const isActive = statusStr === "active";
      const isImported = existingFeature.properties?.source === "import";

      let hasGranularPermission = false;
      let requiredPermissionName = "";

      if (isPlanned) {
        hasGranularPermission = permissions.includes("network:file:delete_feature_planned");
        requiredPermissionName = "Delete Planned Feature Data";
      } else if (isActive) {
        hasGranularPermission = permissions.includes("network:file:delete_feature_live");
        requiredPermissionName = "Delete Live Feature Data";
      } else if (isImported) {
        hasGranularPermission = permissions.includes("network:file:delete_feature_imported");
        requiredPermissionName = "Delete Imported Feature Data";
      } else {
        // Default to live for safety if status is unknown but not imported
        hasGranularPermission = permissions.includes("network:file:delete_feature_live");
        requiredPermissionName = "Delete Live Feature Data";
      }

      if (!isAdminOrManager && !isOwner && !hasGranularPermission) {
        return res.status(403).json({
          success: false,
          message: `You lack the '${requiredPermissionName}' permission to delete this feature.`,
        });
      }

      const { deleteLinkedReports } = req.query;

      const result = await networkPlanningService.softDeleteFeature(
        parseInt(featureId),
        userId,
        deleteLinkedReports === "true",
      );

      res.json(result);

      // Audit Log: Delete Feature (Soft)
      logAudit(
        userId,
        "Deleted network feature (soft)",
        "INFRASTRUCTURE_DELETED",
        parseInt(featureId),
        { action: "SOFT_DELETE" },
        req,
      ).catch((e) => console.error("Audit log failed", e));
    } catch (error) {
      next(error);
    }
  }

  // ============================================================
  // Recycle Bin Operations
  // ============================================================

  async getRecycleBin(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      const items = await networkPlanningService.getRecycleBinItems(
        userId,
        userRole,
      );

      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  async restoreFeature(req, res, next) {
    try {
      const { featureId } = req.params;
      const itemType = req.body.type || req.query.type || 'feature';
      const userId = req.user.id;
      const userRole = req.user.role;

      // Only Admin/Manager can restore OR explicit permission
      const isAdminOrManager =
        userRole &&
        (userRole.toLowerCase() === "admin" ||
          userRole.toLowerCase() === "manager");

      // Check explicit permission (Robust)
      let permissions = req.user.permissions || [];
      if (!permissions) {
        try {
          const { pool } = require("../../../config/database");
          const [userRows] = await pool.query(
            "SELECT permissions FROM users WHERE id = $1",
            [userId],
          );
          permissions =
            userRows && userRows.length > 0 ? userRows[0].permissions : [];
        } catch (e) {
          permissions = [];
        }
      }
      if (typeof permissions === "string") {
        try {
          permissions = JSON.parse(permissions);
        } catch (e) {
          permissions = [];
        }
      }

      const hasRestorePermission =
        Array.isArray(permissions) &&
        permissions.includes("network:recycle:restore");

      if (!isAdminOrManager && !hasRestorePermission) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You need 'Restore Items' permission.",
        });
      }

      const result = await networkPlanningService.restoreItem(
        parseInt(featureId),
        itemType,
        userId,
      );

      res.json(result);

      // Audit Log: Restore Feature
      logAudit(
        userId,
        "Restored network feature",
        "NETWORK_RECYCLE_RESTORE",
        parseInt(featureId),
        { action: "RESTORE" },
        req,
      ).catch((e) => console.error("Audit log failed", e));
    } catch (error) {
      next(error);
    }
  }

  async permanentDeleteFeature(req, res, next) {
    try {
      const { featureId } = req.params;
      const itemType = req.body.type || req.query.type || 'feature';
      const userRole = req.user.role;

      // Only Admin can permanently delete OR explicit permission
      let permissions = req.user.permissions || [];
      // Parse if needed (Robust)
      if (typeof permissions === "string") {
        try {
          permissions = JSON.parse(permissions);
        } catch (e) {
          permissions = [];
        }
      }

      const hasPermDeletePermission =
        Array.isArray(permissions) &&
        permissions.includes("network:recycle:delete");

      if (
        (!userRole || userRole.toLowerCase() !== "admin") &&
        !hasPermDeletePermission
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You need 'Permanently Delete' permission.",
        });
      }

      const result = await networkPlanningService.permanentDeleteItem(
        parseInt(featureId),
        itemType,
      );

      res.json(result);

      // Audit Log: Permanent Delete
      logAudit(
        req.user.id,
        "Permanently deleted network feature",
        "NETWORK_RECYCLE_DELETE_PERMANENT",
        parseInt(featureId),
        { action: "PERMANENT_DELETE" },
        req,
      ).catch((e) => console.error("Audit log failed", e));
    } catch (error) {
      next(error);
    }
  }



  async getPlannedCount(req, res, next) {
    try {
      const { rawPool: pool } = require("../../../config/database");
      let fileIds = null;
      if (req.query.fileIds) {
        fileIds = req.query.fileIds
          .split(',')
          .map((id) => parseInt(id))
          .filter((id) => !isNaN(id));
      } else if (req.query.fileId) {
        fileIds = [parseInt(req.query.fileId)];
      }

      if (!fileIds || fileIds.length === 0) {
        return res.json({ success: true, count: 0 });
      }

      const result = await pool.query(
        `SELECT COUNT(*) as cnt
         FROM network_features
         WHERE file_id = ANY($1::int[])
           AND deleted_at IS NULL
           AND properties->>'status' = 'Planned'`,
        [fileIds]
      );

      res.json({ success: true, count: parseInt(result.rows[0]?.cnt || 0) });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================
  // Global Feature Search (Bypass Folders)
  // ============================================================
  async searchGlobalFeatures(req, res, next) {
    try {
      const q = req.query.q;
      if (!q || q.length < 2) {
         return res.json({ success: true, data: [] });
      }
      
      const { rawPool } = require("../../../config/database");
      const query = `
        SELECT 
          nf.id as id,
          nf.properties,
          ST_AsGeoJSON(ST_Transform(nf.geom, 4326))::json as geometry,
          fl.name as file_name,
          fd.name as region_name,
          fd.folder_type
        FROM network_features nf
        LEFT JOIN network_files fl ON nf.file_id = fl.id
        LEFT JOIN network_folders fd ON fl.folder_id = fd.id
        WHERE nf.deleted_at IS NULL
          AND (nf.properties->>'name' ILIKE $1 OR nf.properties::text ILIKE $1)
        LIMIT 5000
      `;
      
      const result = await rawPool.query(query, [`%${q}%`]);
      const mappedResults = (result.rows || []).map(row => ({
         value: row.id,
         label: row.properties?.name || `Feature ${row.id}`,
         file_name: row.file_name,
         region_name: row.region_name,
         original: row
      }));
      
      res.json({ success: true, data: mappedResults });
    } catch (error) {
      console.error('Global Search Error:', error);
      next(error);
    }
  }
  async emptyRecycleBin(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const result = await networkPlanningService.emptyRecycleBin(
        userId,
        userRole,
      );
      res.json(result);

      // Audit Log: Empty Recycle Bin
      logAudit(
        userId,
        "Emptied entire network recycle bin",
        "NETWORK_RECYCLE_EMPTY",
        null,
        { action: "EMPTY_BIN" },
        req,
      ).catch((e) => console.error("Audit log failed", e));
    } catch (error) {
      next(error);
    }
  }

  async deleteRecycleBinByDate(req, res, next) {
    try {
      const { date } = req.query;
      if (!date) {
        return res
          .status(400)
          .json({ success: false, message: "Date is required" });
      }

      const userId = req.user.id;
      const userRole = req.user.role;
      const result = await networkPlanningService.deleteRecycleBinByDate(
        userId,
        userRole,
        date,
      );
      res.json(result);

      // Audit Log: Delete by Date
      logAudit(
        userId,
        `Cleared recycle bin for date: ${date}`,
        "NETWORK_RECYCLE_DELETE_BY_DATE",
        null,
        { action: "DELETE_BY_DATE", date },
        req,
      ).catch((e) => console.error("Audit log failed", e));
    } catch (error) {
      next(error);
    }
  }
  async getInfraTypeFolders(req, res, next) {
    try {
      const folders = await networkPlanningService.getInfraTypeFolders();
      res.json({ success: true, data: folders });
    } catch (error) {
      next(error);
    }
  }

  async getInfraStateFolders(req, res, next) {
    try {
      const typeId = req.query.typeId ? parseInt(req.query.typeId) : null;
      if (!typeId) {
        return res.status(400).json({ success: false, message: "typeId is required" });
      }
      const folders = await networkPlanningService.getInfraStateFolders(typeId);
      res.json({ success: true, data: folders });
    } catch (error) {
      next(error);
    }
  }

  async getPopStateFolders(req, res, next) {
    try {
      const folders = await networkPlanningService.getPopStateFolders();
      res.json({ success: true, data: folders });
    } catch (error) {
      next(error);
    }
  }

  async getPopList(req, res, next) {
    try {
      const stateFolderId = req.query.folderId ? parseInt(req.query.folderId) : null;
      const pops = await networkPlanningService.getPopList(stateFolderId);
      res.json({ success: true, data: pops });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CatalogController();
