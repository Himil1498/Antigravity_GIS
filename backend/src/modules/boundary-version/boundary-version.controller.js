const boundaryVersionService = require("./boundary-version.service");
const regionService = require("../region/region.service");
const { logAudit } = require("../audit/audit.service");
const { broadcastToAll } = require("../../shared/services/websocketService");

// --- READ Operations ---

const getRegionBoundary = async (req, res) => {
  try {
    const { id: regionId } = req.params;
    const boundary = await boundaryVersionService.getRegionBoundary(regionId);

    if (!boundary) {
      return res.json({ success: true, boundary: null });
    }

    // Format to match frontend Boundary interface
    const formatted = {
      id: boundary.id,
      regionId: boundary.region_id,
      boundaryGeoJSON: boundary.boundary_geojson,
      boundaryType: boundary.boundary_type,
      version: boundary.version_number,
      vertexCount: boundary.vertex_count,
      areaSqKm: boundary.area_sqkm,
      createdBy: boundary.created_by,
      createdAt: boundary.created_at,
      publishedBy: boundary.published_by,
      publishedAt: boundary.published_at,
      source: boundary.source,
      notes: boundary.notes,
      changeReason: boundary.change_reason,
      createdByName: boundary.created_by_name,
      publishedByName: boundary.published_by_name,
    };

    res.json({ success: true, boundary: formatted });
  } catch (error) {
    console.error("Get region boundary error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch boundary" });
  }
};

const getBoundaryHistory = async (req, res) => {
  try {
    const { id: regionId } = req.params;
    const { limit, offset } = req.query;
    const result = await boundaryVersionService.getBoundaryHistory(
      regionId,
      limit,
      offset,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch boundary history" });
  }
};

const getBoundaryChangeHistory = async (req, res) => {
  try {
    const { id: regionId } = req.params;
    const { limit, offset } = req.query;
    const result = await boundaryVersionService.getBoundaryChangeHistory(
      regionId,
      limit,
      offset,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch change history" });
  }
};

const getDraftDetail = async (req, res) => {
  try {
    const { id: regionId } = req.params;
    const userId = req.user.id;
    const draft = await boundaryVersionService.getDraftDetail(regionId, userId);
    res.json({ success: true, draft });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch draft" });
  }
};

// --- WRITE Operations (Admin/Manager) ---

const createOrUpdateDraft = async (req, res) => {
  try {
    // Consolidating create/update logic in controller or using service helper if exists?
    // Service has createDraft and updateDraft separate
    // But original controller `createOrUpdateDraft` handled both.
    // Let's implement that logic here or in a service facade.
    // It's better to keep controller thin. Let's start transaction here or assume service handles it?
    // Service methods are atomic but not combined.
    // Re-implementing logic here for now to match legacy behavior without over-engineering service.

    const { id: regionId } = req.params;
    const { boundaryGeoJSON, changeReason, notes, source } = req.body;
    const userId = req.user.id; // assume req.user is set

    // Calculate Vertex count
    let vertexCount = 0;
    if (boundaryGeoJSON.type === "Polygon") {
      boundaryGeoJSON.coordinates.forEach(
        (ring) => (vertexCount += ring.length),
      );
    } else if (boundaryGeoJSON.type === "MultiPolygon") {
      boundaryGeoJSON.coordinates.forEach((poly) =>
        poly.forEach((ring) => (vertexCount += ring.length)),
      );
    }

    const existingDrafts = await boundaryVersionService.checkExistingDraft(
      regionId,
      userId,
    );

    let draftId, versionNumber;
    const isUpdate = existingDrafts.length > 0;

    if (isUpdate) {
      draftId = existingDrafts[0].id;
      versionNumber = existingDrafts[0].version_number;
      await boundaryVersionService.updateDraft({
        draftId,
        boundaryGeoJSON,
        vertexCount,
        notes,
        changeReason,
        source,
      });
    } else {
      versionNumber =
        await boundaryVersionService.getNextVersionNumber(regionId);
      const result = await boundaryVersionService.createDraft({
        regionId,
        boundaryGeoJSON,
        vertexCount,
        versionNumber,
        userId,
        notes,
        changeReason,
        source,
      });
      draftId = result.id;
    }

    res.json({
      success: true,
      message: isUpdate ? "Draft updated" : "Draft created",
      draft: {
        id: draftId,
        regionId,
        versionNumber,
        vertexCount,
        type: boundaryGeoJSON.type,
        status: "draft",
      },
    });

    try {
      await logAudit(
        userId,
        isUpdate ? "Updated boundary draft" : "Created boundary draft",
        "BOUNDARY_DRAFT_SAVE",
        draftId,
        { regionId, versionNumber, vertexCount, isUpdate },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }
  } catch (error) {
    console.error("Create/Update draft error:", error);
    res.status(500).json({ success: false, error: "Failed to save draft" });
  }
};

const publishDraft = async (req, res) => {
  try {
    const { id: regionId } = req.params;
    const userId = req.user.id;
    const { boundaryGeoJSON, publishReason, notifyUsers } = req.body;

    let result;
    if (boundaryGeoJSON) {
      // Direct publish with boundary data
      result = await boundaryVersionService.publishBoundaryDirect(
        regionId,
        userId,
        boundaryGeoJSON,
        publishReason,
      );
    } else {
      // Legacy publish from existing draft
      result = await boundaryVersionService.publishDraft(regionId, userId);
    }

    
    // Emit WebSocket event for real-time updates
    try {
      let regionName = "Region";
      const region = await regionService.getRegionById(regionId);
      if (region) regionName = region.name;

      broadcastToAll({
        event: "boundary_published",
        data: {
          regionId: parseInt(regionId),
          regionName: regionName,
          versionNumber: result?.version || 1,
          timestamp: new Date().toISOString()
        },
      });
    } catch (e) {
      console.warn("Failed to emit boundary_published event", e);
    }

    res.json({
      success: true,
      message: "Boundary published successfully",
      boundary: result,
    });

    try {
      await logAudit(
        userId,
        "Published region boundary",
        "BOUNDARY_PUBLISH",
        regionId,
        { publishReason, notifyUsers },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }
  } catch (error) {
    console.error("Publish draft error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to publish boundary",
    });
  }
};

const discardDraft = async (req, res) => {
  try {
    // Need to find draft ID by region ID ? or pass draft ID?
    // Usually discard is by Region ID in this context "discard draft for this region"
    // Let's look up draft for region
    const { id: regionId } = req.params;
    const drafts = await boundaryVersionService.checkExistingDraft(regionId);
    if (drafts.length === 0)
      return res.status(404).json({ success: false, error: "No draft found" });

    await boundaryVersionService.deleteDraft(drafts[0].id);

    try {
      await logAudit(
        req.user.id,
        "Discarded boundary draft",
        "BOUNDARY_DRAFT_DISCARD",
        drafts[0].id,
        { regionId },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.json({ success: true, message: "Draft discarded" });
  } catch (e) {
    res.status(500).json({ success: false, error: "Failed to discard draft" });
  }
};

const unpublishBoundary = async (req, res) => {
  try {
    const { unpublishReason } = req.body || {};
    const result = await boundaryVersionService.unpublishBoundary(req.params.id, req.user.id);

    try {
      await logAudit(
        req.user.id,
        "Unpublished region boundary",
        "BOUNDARY_UNPUBLISH",
        req.params.id,
        { 
          action: "UNPUBLISH", 
          unpublishReason: unpublishReason || "No reason provided",
          draftCreated: result.draftCreated,
          hadExistingDraft: result.hadExistingDraft,
        },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    try {
      let regionName = "Region";
      const region = await regionService.getRegionById(req.params.id);
      if (region) regionName = region.name;

      broadcastToAll({
        event: "boundary_published",
        data: {
          regionId: parseInt(req.params.id),
          regionName: regionName,
          versionNumber: 0,
          timestamp: new Date().toISOString()
        },
      });
    } catch (e) {
      console.warn("Failed to emit boundary_published event on unpublish", e);
    }

    const message = result.draftCreated
      ? "Boundary unpublished and saved as draft. You can continue editing."
      : result.hadExistingDraft
        ? "Boundary unpublished. Your existing draft is preserved."
        : "Boundary unpublished (archived).";

    res.json({ success: true, message, ...result });
  } catch (e) {
    console.error("Unpublish boundary failed:", e);
    res.status(500).json({ success: false, error: "Failed to unpublish" });
  }
};

const revertToVersion = async (req, res) => {
  try {
    await boundaryVersionService.revertToVersion(
      req.params.id,
      req.params.versionId,
      req.user.id,
      req.body.reason,
    );

    try {
      await logAudit(
        req.user.id,
        "Reverted region boundary",
        "BOUNDARY_REVERT",
        req.params.id,
        { versionId: req.params.versionId, reason: req.body.reason },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.json({ success: true, message: "Reverted successfully" });
  } catch (e) {
    res.status(500).json({ success: false, error: "Failed to revert" });
  }
};

const deleteAllBoundaryData = async (req, res) => {
  try {
    const regionId = req.params.id;
    const { deleteReason } = req.body || {};

    // Get counts before deletion for audit
    const counts = await boundaryVersionService.getDeletionCounts(regionId);

    await boundaryVersionService.deleteAllBoundaryData(regionId);

    try {
      await logAudit(
        req.user.id,
        `Deleted all boundary data for region (${counts.versions} versions)`,
        "BOUNDARY_DELETE_ALL",
        regionId,
        { action: "DELETE_ALL", deleteReason, ...counts },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    try {
      let regionName = "Region";
      const region = await regionService.getRegionById(regionId);
      if (region) regionName = region.name;

      broadcastToAll({
        event: "boundary_published",
        data: {
          regionId: parseInt(regionId),
          regionName: regionName,
          versionNumber: 0,
          timestamp: new Date().toISOString()
        },
      });
    } catch (e) {
      console.warn("Failed to emit boundary_published event on delete", e);
    }

    res.json({
      success: true,
      message: "All boundary data deleted",
      deleted: counts,
    });
  } catch (e) {
    console.error("Delete all boundary data failed:", e);
    res.status(500).json({ success: false, error: "Failed to delete boundary data" });
  }
};

module.exports = {
  getRegionBoundary,
  getBoundaryHistory,
  getBoundaryChangeHistory,
  getDraftDetail,
  createOrUpdateDraft,
  publishDraft,
  discardDraft,
  unpublishBoundary,
  revertToVersion,
  deleteAllBoundaryData,
};
