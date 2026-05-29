const elevationService = require("../services/elevation.service");
const { ERRORS, MESSAGES } = require("../constants");
const { logAudit } = require("../../audit/audit.service");

const getAllProfiles = async (req, res) => {
  try {
    const profiles = await elevationService.getAllProfiles(
      req.user.id,
      req.user.role,
      req.query,
    );
    res.json({ success: true, profiles });
  } catch (error) {
    console.error("Get profiles error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_GET });
  }
};

const getProfileById = async (req, res) => {
  try {
    const profile = await elevationService.getProfileById(
      req.params.id,
      req.user.id,
    );
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.PROFILE_NOT_FOUND });
    }
    res.json({ success: true, profile });
  } catch (error) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.FAILED_TO_GET_PROFILE });
  }
};

const createProfile = async (req, res) => {
  try {
    const result = await elevationService.createProfile(
      req.body,
      req.user.id,
      req,
    );

    await logAudit(
      req.user.id,
      "CREATE_ELEVATION_PROFILE",
      "elevation_profile",
      result.id,
      { name: result.name },
      req,
    );

    res.status(201).json({ success: true, profile: result });
  } catch (error) {
    if (error.message === "START_END_REQUIRED") {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.START_END_REQUIRED });
    }
    console.error("Create profile error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_CREATE });
  }
};

const updateProfile = async (req, res) => {
  try {
    await elevationService.updateProfile(
      req.params.id,
      req.user.id,
      req.body,
      req,
    );

    await logAudit(
      req.user.id,
      "UPDATE_ELEVATION_PROFILE",
      "elevation_profile",
      req.params.id,
      req.body,
      req,
    );

    res.json({ success: true, message: MESSAGES.PROFILE_UPDATED });
  } catch (error) {
    if (error.message === "NO_FIELDS_TO_UPDATE") {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.NO_FIELDS_TO_UPDATE });
    }
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_UPDATE });
  }
};

const deleteProfile = async (req, res) => {
  try {
    await elevationService.deleteProfile(req.params.id, req.user.id, req);

    await logAudit(
      req.user.id,
      "DELETE_ELEVATION_PROFILE",
      "elevation_profile",
      req.params.id,
      {},
      req,
    );

    res.json({ success: true, message: MESSAGES.PROFILE_DELETED });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_DELETE });
  }
};

const calculateElevation = async (req, res) => {
  try {
    const result = await elevationService.calculateElevation(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "START_END_REQUIRED") {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.START_END_REQUIRED });
    }
    console.error("Calculate elevation error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_CALCULATE });
  }
};

module.exports = {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  calculateElevation,
};
