const { INDIA_BOUNDS, INDIA_MAINLAND_BOUNDS, STATE_BOUNDARIES } = require('./constants');

/**
 * Validates if coordinates are within India's boundaries
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {boolean} strictMainland - If true, excludes islands (default: false)
 * @returns {Object} { valid: boolean, error?: string }
 */
function isValidIndiaCoordinate(latitude, longitude, strictMainland = false) {
  // Type validation
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return {
      valid: false,
      error: 'Coordinates must be numbers'
    };
  }

  // Check for NaN
  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      valid: false,
      error: 'Invalid coordinate values (NaN)'
    };
  }

  // General coordinate range check
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return {
      valid: false,
      error: 'Coordinates out of valid range (lat: -90 to 90, lng: -180 to 180)'
    };
  }

  const bounds = strictMainland ? INDIA_MAINLAND_BOUNDS : INDIA_BOUNDS;

  // India boundary check
  if (latitude < bounds.latitude.min || latitude > bounds.latitude.max) {
    return {
      valid: false,
      error: `Latitude ${latitude.toFixed(5)} is outside India (${bounds.latitude.min} to ${bounds.latitude.max})`
    };
  }

  if (longitude < bounds.longitude.min || longitude > bounds.longitude.max) {
    return {
      valid: false,
      error: `Longitude ${longitude.toFixed(5)} is outside India (${bounds.longitude.min} to ${bounds.longitude.max})`
    };
  }

  return { valid: true };
}

/**
 * Detects which state/UT the coordinates belong to
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Object} { found: boolean, state?: string, message?: string }
 */
function detectState(latitude, longitude) {
  // First validate it's in India
  const validation = isValidIndiaCoordinate(latitude, longitude);
  if (!validation.valid) {
    return {
      found: false,
      message: validation.error
    };
  }

  // Check each state boundary
  for (const state of STATE_BOUNDARIES) {
    if (
      latitude >= state.latMin &&
      latitude <= state.latMax &&
      longitude >= state.lngMin &&
      longitude <= state.lngMax
    ) {
      return {
        found: true,
        state: state.name
      };
    }
  }

  // Coordinates are in India but not matching any state (possible offshore/border area)
  return {
    found: false,
    message: 'Coordinates are within India but no state detected (possible offshore or border area)'
  };
}

module.exports = {
  isValidIndiaCoordinate,
  detectState
};
