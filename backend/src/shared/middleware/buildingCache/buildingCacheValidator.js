/**
 * Building Cache Validation Middleware
 * Request validation for building cache endpoints
 */

const { ERRORS } = require('../../../modules/building-cache/constants');

/**
 * Validate bounding box format
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const validateBbox = (req, res, next) => {
  const { bbox } = req.body;

  if (!bbox) {
    return res.status(400).json({
      success: false,
      error: ERRORS.BBOX_REQUIRED
    });
  }

  const { south, north, west, east } = bbox;

  if (
    typeof south !== 'number' ||
    typeof north !== 'number' ||
    typeof west !== 'number' ||
    typeof east !== 'number'
  ) {
    return res.status(400).json({
      success: false,
      error: 'Bounding box must contain valid numeric values for south, north, west, and east'
    });
  }

  if (south >= north || west >= east) {
    return res.status(400).json({
      success: false,
      error: 'Invalid bounding box: south must be less than north, west must be less than east'
    });
  }

  next();
};

/**
 * Validate save cache request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const validateSaveCache = (req, res, next) => {
  const { bbox, building_data } = req.body;

  if (!bbox || !building_data) {
    return res.status(400).json({
      success: false,
      error: ERRORS.BUILDING_DATA_REQUIRED
    });
  }

  // Validate bbox format
  const { south, north, west, east } = bbox;
  if (
    typeof south !== 'number' ||
    typeof north !== 'number' ||
    typeof west !== 'number' ||
    typeof east !== 'number'
  ) {
    return res.status(400).json({
      success: false,
      error: 'Bounding box must contain valid numeric values'
    });
  }

  if (south >= north || west >= east) {
    return res.status(400).json({
      success: false,
      error: 'Invalid bounding box coordinates'
    });
  }

  next();
};

/**
 * Validate admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const validateAdmin = (req, res, next) => {
  const userRole = (req.user.role || '').toLowerCase();

  if (userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: ERRORS.ADMIN_REQUIRED
    });
  }

  next();
};

module.exports = {
  validateBbox,
  validateSaveCache,
  validateAdmin
};
