const polygonService = require("../services/polygon.service");
const { ERRORS, SUCCESS } = require("../constants");
const { logAudit } = require("../../audit/audit.service");

const getAllPolygons = async (req, res) => {
  try {
    const polygons = await polygonService.getAllPolygons(
      req.user.id,
      req.user.role,
      req.query,
    );
    res.json({ success: true, polygons });
  } catch (error) {
    console.error("Get polygons error:", error);
    res.status(500).json({ success: false, error: ERRORS.GET_POLYGONS_FAILED });
  }
};

const getPolygonById = async (req, res) => {
  try {
    const polygon = await polygonService.getPolygonById(
      req.params.id,
      req.user.id,
    );
    if (!polygon) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.POLYGON_NOT_FOUND });
    }
    res.json({ success: true, polygon });
  } catch (error) {
    console.error("Get polygon error:", error);
    res.status(500).json({ success: false, error: ERRORS.GET_POLYGON_FAILED });
  }
};

const createPolygon = async (req, res) => {
  try {
    const result = await polygonService.createPolygon(
      req.body,
      req.user.id,
      req,
    );

    await logAudit(
      req.user.id,
      "CREATE_POLYGON_DRAWING",
      "polygon_drawing",
      result.id,
      { name: result.name, area: result.area },
      req,
    );

    res.status(201).json({ success: true, polygon: result });
  } catch (error) {
    if (error.message === "INVALID_COORDS") {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.INVALID_POLYGON_COORDS });
    }
    console.error("Create polygon error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.CREATE_POLYGON_FAILED });
  }
};

const updatePolygon = async (req, res) => {
  try {
    await polygonService.updatePolygon(
      req.params.id,
      req.user.id,
      req.body,
      req,
    );

    await logAudit(
      req.user.id,
      "UPDATE_POLYGON_DRAWING",
      "polygon_drawing",
      req.params.id,
      req.body,
      req,
    );

    res.json({ success: true, message: SUCCESS.POLYGON_UPDATED });
  } catch (error) {
    if (error.message === "NO_UPDATES") {
      return res.status(400).json({ success: false, error: ERRORS.NO_UPDATES });
    }
    console.error("Update polygon error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.UPDATE_POLYGON_FAILED });
  }
};

const deletePolygon = async (req, res) => {
  try {
    await polygonService.deletePolygon(req.params.id, req.user.id, req);

    await logAudit(
      req.user.id,
      "DELETE_POLYGON_DRAWING",
      "polygon_drawing",
      req.params.id,
      {},
      req,
    );

    res.json({ success: true, message: SUCCESS.POLYGON_DELETED });
  } catch (error) {
    console.error("Delete polygon error:", error);
    res
      .status(500)
      .json({ success: false, error: ERRORS.DELETE_POLYGON_FAILED });
  }
};

module.exports = {
  getAllPolygons,
  getPolygonById,
  createPolygon,
  updatePolygon,
  deletePolygon,
};
