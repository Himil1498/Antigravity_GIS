/**
 * Feature Controller - Basic CRUD
 * Main CRUD operations for GIS features
 */

const { ERRORS, MESSAGES } = require("../constants");
const { logAudit } = require("../../audit/audit.service");
const {
  getAllFeatures: fetchAllFeatures,
  getFeatureById: fetchFeatureById,
  createFeature: createFeatureRecord,
  updateFeature: updateFeatureRecord,
  deleteFeature: deleteFeatureRecord,
  checkFeatureOwnership,
} = require("../services/feature-basic.service");

/**
 * @route   GET /api/features
 * @desc    Get all user's GIS features (filtered by regions)
 * @access  Private
 */
const getAllFeatures = async (req, res) => {
  try {
    const userId = req.user.id;
    const { region_id, feature_type, search } = req.query;

    const features = await fetchAllFeatures(
      userId,
      region_id,
      feature_type,
      search,
    );

    res.json({ success: true, features });
  } catch (error) {
    console.error("Get features error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_GET });
  }
};

/**
 * @route   GET /api/features/:id
 * @desc    Get feature by ID
 * @access  Private
 */
const getFeatureById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const feature = await fetchFeatureById(id, userId);

    if (!feature) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.FEATURE_NOT_FOUND });
    }

    res.json({ success: true, feature });
  } catch (error) {
    console.error("Get feature error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.FAILED_TO_GET_FEATURE });
  }
};

/**
 * @route   POST /api/features
 * @desc    Create GIS feature
 * @access  Private
 */
const createFeature = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      feature_type,
      geometry,
      latitude,
      longitude,
      properties,
      region_id,
      tags,
    } = req.body;

    if (!name || !feature_type || !geometry) {
      return res.status(400).json({
        success: false,
        error: ERRORS.NAME_TYPE_GEOMETRY_REQUIRED,
      });
    }

    const featureId = await createFeatureRecord(userId, {
      name,
      description,
      feature_type,
      geometry,
      latitude,
      longitude,
      properties,
      region_id,
      tags,
    });

    try {
      await logAudit(
        userId,
        "Created GIS feature",
        "FEATURE_CREATE",
        featureId,
        { name, feature_type, region_id },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.status(201).json({
      success: true,
      feature: {
        id: featureId,
        name,
        feature_type,
        latitude,
        longitude,
      },
    });
  } catch (error) {
    console.error("Create feature error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_CREATE });
  }
};

/**
 * @route   PUT /api/features/:id
 * @desc    Update GIS feature (owner or admin)
 * @access  Private
 */
const updateFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { name, description, properties, tags } = req.body;

    // Check ownership or admin
    const ownership = await checkFeatureOwnership(id, userId, userRole);

    if (!ownership.found) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.FEATURE_NOT_FOUND });
    }

    if (!ownership.canModify) {
      return res.status(403).json({
        success: false,
        error: ERRORS.ONLY_OWNER_OR_ADMIN_UPDATE,
      });
    }

    const result = await updateFeatureRecord(id, {
      name,
      description,
      properties,
      tags,
    });

    if (!result.updated) {
      return res.status(400).json({ success: false, error: result.error });
    }

    try {
      await logAudit(
        userId,
        "Updated GIS feature",
        "FEATURE_UPDATE",
        id,
        { name, description, properties, tags },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.json({ success: true, message: MESSAGES.FEATURE_UPDATED });
  } catch (error) {
    console.error("Update feature error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_UPDATE });
  }
};

/**
 * @route   DELETE /api/features/:id
 * @desc    Delete GIS feature (owner or admin)
 * @access  Private
 */
const deleteFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check ownership or admin
    const ownership = await checkFeatureOwnership(id, userId, userRole);

    if (!ownership.found) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.FEATURE_NOT_FOUND });
    }

    if (!ownership.canModify) {
      return res.status(403).json({
        success: false,
        error: ERRORS.ONLY_OWNER_OR_ADMIN_DELETE,
      });
    }

    await deleteFeatureRecord(id);

    try {
      await logAudit(
        userId,
        "Deleted GIS feature",
        "FEATURE_DELETE",
        id,
        { action: "DELETE" },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.json({ success: true, message: MESSAGES.FEATURE_DELETED });
  } catch (error) {
    console.error("Delete feature error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_DELETE });
  }
};

module.exports = {
  getAllFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
};
