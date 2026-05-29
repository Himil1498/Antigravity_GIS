const regionService = require("./region.service");
const { logAudit } = require("../audit/audit.service");
const { notifyAllAdmins } = require("../notification/services/notification.service");

const getAllRegions = async (req, res) => {
  try {
    const { type, parentId } = req.query;
    const regions = await regionService.getAllRegions(
      type,
      parentId,
      req.user.id,
      req.user.role,
    );
    res.json({ success: true, regions });
  } catch (error) {
    console.error("Get regions error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch regions" });
  }
};

const getRegionById = async (req, res) => {
  try {
    const region = await regionService.getRegionById(req.params.id);
    if (!region) {
      return res
        .status(404)
        .json({ success: false, error: "Region not found" });
    }
    res.json({ success: true, region });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch region" });
  }
};

const getChildRegions = async (req, res) => {
  try {
    const regions = await regionService.getChildRegions(req.params.id);
    res.json({ success: true, regions });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch child regions" });
  }
};

const getRegionHierarchy = async (req, res) => {
  try {
    const hierarchy = await regionService.getRegionHierarchy(
      req.user.id,
      req.user.role,
    );
    res.json({ success: true, hierarchy });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch hierarchy" });
  }
};

const getRegionUsers = async (req, res) => {
  try {
    const users = await regionService.getRegionUsers(req.params.id);
    res.json({ success: true, users });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch region users" });
  }
};

const createRegion = async (req, res) => {
  try {
    if (!req.body.name || !req.body.code || !req.body.type) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }
    const region = await regionService.createRegion(req.body);

    // Audit
    await logAudit(
      req.user.id,
      "Create Region",
      "REGION_CREATE",
      region.id,
      { name: region.name, code: region.code, type: region.type },
      req,
    );

    try {
      await notifyAllAdmins(
        'region_create',
        'New Region Created',
        `Region "${region.name}" (${region.code}) was created by User ID: ${req.user.id}.`,
        { related_entity_id: region.id, related_entity_type: 'region' }
      );
    } catch (e) {
      console.error("Notification failed", e);
    }

    res.status(201).json({ success: true, message: "Region created", region });
  } catch (error) {
    console.error("Create region error:", error);
    res.status(500).json({ success: false, error: "Failed to create region" });
  }
};

const updateRegion = async (req, res) => {
  try {
    const updated = await regionService.updateRegion(req.params.id, req.body);
    if (!updated) {
      return res
        .status(400)
        .json({ success: false, error: "No updates provided" });
    }

    // Audit
    await logAudit(
      req.user.id,
      "Update Region",
      "REGION_UPDATE",
      req.params.id,
      { updates: req.body },
      req,
    );

    try {
      await notifyAllAdmins(
        'region_update',
        'Region Updated',
        `Region ID ${req.params.id} was updated by User ID: ${req.user.id}.`,
        { related_entity_id: req.params.id, related_entity_type: 'region' }
      );
    } catch (e) {
      console.error("Notification failed", e);
    }

    res.json({ success: true, message: "Region updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update region" });
  }
};

const deleteRegion = async (req, res) => {
  try {
    await regionService.deleteRegion(req.params.id);

    // Audit
    await logAudit(
      req.user.id,
      "Delete Region",
      "REGION_DELETE",
      req.params.id,
      { action: "DELETE" },
      req,
    );

    try {
      await notifyAllAdmins(
        'region_delete',
        'Region Deleted',
        `Region ID ${req.params.id} was deleted by User ID: ${req.user.id}.`,
        { related_entity_id: req.params.id, related_entity_type: 'region' }
      );
    } catch (e) {
      console.error("Notification failed", e);
    }

    res.json({ success: true, message: "Region deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete region" });
  }
};

module.exports = {
  getAllRegions,
  getRegionById,
  getChildRegions,
  getRegionHierarchy,
  getRegionUsers,
  createRegion,
  updateRegion,
  deleteRegion,
};
