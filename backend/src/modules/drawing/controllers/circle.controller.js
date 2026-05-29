const circleService = require("../services/circle.service");
const { ERRORS, SUCCESS } = require("../constants");
const { logAudit } = require("../../audit/audit.service");

const getAllCircles = async (req, res) => {
  try {
    const circles = await circleService.getAllCircles(
      req.user.id,
      req.user.role,
      req.query,
    );
    res.json({ success: true, circles });
  } catch (error) {
    console.error("Get circles error:", error);
    res.status(500).json({ success: false, error: ERRORS.GET_CIRCLES_FAILED });
  }
};

const getCircleById = async (req, res) => {
  try {
    const circle = await circleService.getCircleById(
      req.params.id,
      req.user.id,
    );
    if (!circle) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.CIRCLE_NOT_FOUND });
    }
    res.json({ success: true, circle });
  } catch (error) {
    console.error("Get circle error:", error);
    res.status(500).json({ success: false, error: ERRORS.GET_CIRCLE_FAILED });
  }
};

const createCircle = async (req, res) => {
  try {
    const result = await circleService.createCircle(req.body, req.user.id, req);

    await logAudit(
      req.user.id,
      "CREATE_CIRCLE_DRAWING",
      "circle_drawing",
      result.id,
      { name: result.name, radius: result.radius },
      req,
    );

    res.status(201).json({ success: true, circle: result });
  } catch (error) {
    if (error.message === "INVALID_CIRCLE_PARAMS") {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.INVALID_CIRCLE_PARAMS });
    }
    console.error("Create circle error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.CREATE_CIRCLE_FAILED });
  }
};

const updateCircle = async (req, res) => {
  try {
    await circleService.updateCircle(req.params.id, req.user.id, req.body, req);

    await logAudit(
      req.user.id,
      "UPDATE_CIRCLE_DRAWING",
      "circle_drawing",
      req.params.id,
      req.body,
      req,
    );

    res.json({ success: true, message: SUCCESS.CIRCLE_UPDATED });
  } catch (error) {
    if (error.message === "NO_UPDATES") {
      return res.status(400).json({ success: false, error: ERRORS.NO_UPDATES });
    }
    console.error("Update circle error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.UPDATE_CIRCLE_FAILED });
  }
};

const deleteCircle = async (req, res) => {
  try {
    await circleService.deleteCircle(req.params.id, req.user.id, req);

    await logAudit(
      req.user.id,
      "DELETE_CIRCLE_DRAWING",
      "circle_drawing",
      req.params.id,
      {},
      req,
    );

    res.json({ success: true, message: SUCCESS.CIRCLE_DELETED });
  } catch (error) {
    console.error("Delete circle error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.DELETE_CIRCLE_FAILED });
  }
};

module.exports = {
  getAllCircles,
  getCircleById,
  createCircle,
  updateCircle,
  deleteCircle,
};
