const { isValidIndiaCoordinate, detectState } = require('./validators');

/**
 * Validates a batch of coordinates
 * @param {Array} coordinates - Array of {latitude, longitude, id?, name?}
 * @returns {Object} { valid: [], invalid: [], summary: {} }
 */
function validateCoordinateBatch(coordinates) {
  const valid = [];
  const invalid = [];

  coordinates.forEach((coord) => {
    const validation = isValidIndiaCoordinate(coord.latitude, coord.longitude);
    const stateDetection = detectState(coord.latitude, coord.longitude);

    const result = {
      ...coord,
      validation,
      state: stateDetection.state || null,
      stateDetectionMessage: stateDetection.message || null
    };

    if (validation.valid) {
      valid.push(result);
    } else {
      invalid.push(result);
    }
  });

  return {
    valid,
    invalid,
    summary: {
      total: coordinates.length,
      validCount: valid.length,
      invalidCount: invalid.length,
      validPercentage: ((valid.length / coordinates.length) * 100).toFixed(2)
    }
  };
}

module.exports = {
  validateCoordinateBatch
};
