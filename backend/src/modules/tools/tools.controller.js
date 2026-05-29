const ExcelKmlService = require("../../services/ExcelKmlService");
const AppError = require("../../shared/utils/AppError");
const asyncHandler = require("../../shared/utils/asyncHandler");

/**
 * Download sample Excel template for Excel to KML/KMZ conversion
 */
const downloadSample = asyncHandler(async (req, res, next) => {
  try {
    const buffer = ExcelKmlService.generateSampleExcel();
    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=opticonnect_sample.xlsx"
    );
    
    return res.send(buffer);
  } catch (error) {
    return next(new AppError("Failed to generate sample Excel template", 500));
  }
});

/**
 * Convert uploaded Excel file to KML format
 */
const convertExcelToKml = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No Excel file uploaded", 400));
  }

  try {
    // 1. Parse Excel buffer
    const parsedData = ExcelKmlService.parseExcel(req.file.buffer);
    
    // 2. Validate parsed data
    const validationResult = ExcelKmlService.validateData(parsedData);
    if (!validationResult.valid) {
      return next(
        new AppError(
          `Validation failed: ${validationResult.errors.join(", ")}`,
          400
        )
      );
    }

    // 3. Generate KML string
    const kmlContent = ExcelKmlService.generateKml(parsedData);

    // 4. Send KML response
    res.setHeader("Content-Type", "application/vnd.google-earth.kml+xml");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.file.originalname.replace(
        /\.[^/.]+$/,
        ""
      )}.kml`
    );

    return res.send(Buffer.from(kmlContent, "utf-8"));
  } catch (error) {
    return next(
      new AppError(
        error.message || "Failed to convert Excel to KML format",
        500
      )
    );
  }
});

module.exports = {
  downloadSample,
  convertExcelToKml,
};
