const distanceService = require("../services/distance.service");
const { ERRORS, MESSAGES } = require("../constants");
const { logAudit } = require("../../audit/audit.service");

const getAllMeasurements = async (req, res) => {
  try {
    const measurements = await distanceService.getAllMeasurements(
      req.user.id,
      req.user.role,
      req.query,
    );
    res.json({ success: true, measurements });
  } catch (error) {
    console.error("Get measurements error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_GET });
  }
};

const getMeasurementById = async (req, res) => {
  try {
    const measurement = await distanceService.getMeasurementById(
      req.params.id,
      req.user.id,
    );
    if (!measurement) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.MEASUREMENT_NOT_FOUND });
    }
    res.json({ success: true, measurement });
  } catch (error) {
    console.error("Get measurement error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.FAILED_TO_GET_MEASUREMENT });
  }
};

const createMeasurement = async (req, res) => {
  try {
    const result = await distanceService.createMeasurement(
      req.body,
      req.user.id,
      req,
    );

    await logAudit(
      req.user.id,
      "CREATE_DISTANCE_MEASUREMENT",
      "distance_measurement",
      result.id,
      { name: result.name, distance: result.total_distance },
      req,
    );

    res.status(201).json({ success: true, measurement: result });
  } catch (error) {
    if (error.message === "POINTS_DISTANCE_REQUIRED") {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.POINTS_DISTANCE_REQUIRED });
    }
    console.error("Create measurement error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_CREATE });
  }
};

const updateMeasurement = async (req, res) => {
  try {
    await distanceService.updateMeasurement(
      req.params.id,
      req.user.id,
      req.body,
      req,
    );

    await logAudit(
      req.user.id,
      "UPDATE_DISTANCE_MEASUREMENT",
      "distance_measurement",
      req.params.id,
      req.body,
      req,
    );

    res.json({ success: true, message: MESSAGES.MEASUREMENT_UPDATED });
  } catch (error) {
    if (error.message === "NO_FIELDS_TO_UPDATE") {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.NO_FIELDS_TO_UPDATE });
    }
    console.error("Update measurement error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_UPDATE });
  }
};

const deleteMeasurement = async (req, res) => {
  try {
    await distanceService.deleteMeasurement(req.params.id, req.user.id, req);

    await logAudit(
      req.user.id,
      "DELETE_DISTANCE_MEASUREMENT",
      "distance_measurement",
      req.params.id,
      {},
      req,
    );

    res.json({ success: true, message: MESSAGES.MEASUREMENT_DELETED });
  } catch (error) {
    console.error("Delete measurement error:", error);
    res.status(500).json({ success: false, error: ERRORS.FAILED_TO_DELETE });
  }
};

module.exports = {
  getAllMeasurements,
  getMeasurementById,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
};
