const sectorService = require("../services/sector.service");
const { ERRORS } = require("../constants");
const { logAudit } = require("../../audit/audit.service");

const getAllSectors = async (req, res) => {
  try {
    const sectors = await sectorService.getAllSectors(
      req.user.id,
      req.user.role,
      req.query,
    );
    res.json({ success: true, sectors });
  } catch (error) {
    console.error("Get sectors error:", error);
    res.status(500).json({ success: false, error: ERRORS.GET_SECTORS_FAILED });
  }
};

const getSectorById = async (req, res) => {
  try {
    const sector = await sectorService.getSectorById(
      req.params.id,
      req.user.id,
    );
    if (!sector) {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.SECTOR_NOT_FOUND });
    }
    res.json({ success: true, sector });
  } catch (error) {
    console.error("Get sector error:", error);
    res.status(500).json({ success: false, error: ERRORS.GET_SECTOR_FAILED });
  }
};

const createSector = async (req, res) => {
  try {
    const result = await sectorService.createSector(req.body, req.user.id, req);

    await logAudit(
      req.user.id,
      "CREATE_SECTOR_RF",
      "sector_rf",
      result.id,
      { name: result.name, radius: result.radius },
      req,
    );

    res.status(201).json({ success: true, sector: result });
  } catch (error) {
    if (error.message === "MISSING_FIELDS") {
      return res
        .status(400)
        .json({ success: false, error: ERRORS.MISSING_FIELDS });
    }
    console.error("Create sector error:", error);
    res.status(500).json({ success: false, error: ERRORS.CREATE_FAILED });
  }
};

const updateSector = async (req, res) => {
  try {
    await sectorService.updateSector(req.params.id, req.body, req.user.id, req);

    await logAudit(
      req.user.id,
      "UPDATE_SECTOR_RF",
      "sector_rf",
      req.params.id,
      req.body,
      req,
    );

    res.json({ success: true, message: "Sector updated successfully" });
  } catch (error) {
    if (error.message === "NO_UPDATES") {
      return res.status(400).json({ success: false, error: ERRORS.NO_UPDATES });
    }
    if (error.message === "SECTOR_NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.SECTOR_NOT_FOUND });
    }
    console.error("Update sector error:", error);
    res.status(500).json({ success: false, error: ERRORS.UPDATE_FAILED });
  }
};

const deleteSector = async (req, res) => {
  try {
    await sectorService.deleteSector(req.params.id, req.user.id, req);

    await logAudit(
      req.user.id,
      "DELETE_SECTOR_RF",
      "sector_rf",
      req.params.id,
      {},
      req,
    );

    res.json({ success: true, message: "Sector deleted successfully" });
  } catch (error) {
    if (error.message === "SECTOR_NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.SECTOR_NOT_FOUND });
    }
    console.error("Delete sector error:", error);
    res.status(500).json({ success: false, error: ERRORS.DELETE_FAILED });
  }
};

const calculateCoverage = async (req, res) => {
  try {
    const coverage = await sectorService.calculateCoverage(
      req.params.id,
      req.user.id,
    );
    res.json({ success: true, coverage });
  } catch (error) {
    if (error.message === "SECTOR_NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, error: ERRORS.SECTOR_NOT_FOUND });
    }
    console.error("Calculate coverage error:", error);
    res.status(500).json({ success: false, error: ERRORS.CALCULATE_FAILED });
  }
};

module.exports = {
  getAllSectors,
  getSectorById,
  createSector,
  updateSector,
  deleteSector,
  calculateCoverage,
};
