/**
 * Coordinate Validation Utilities
 * 
 * Provides functions to validate GPS coordinates for India, 
 * detect states, and process batches of coordinates.
 */

const { INDIA_BOUNDS, INDIA_MAINLAND_BOUNDS, STATE_BOUNDARIES } = require('./constants');
const { isValidIndiaCoordinate, detectState } = require('./validators');
const { validateCoordinateBatch } = require('./batch');
const { getNearestState } = require('./helper');

module.exports = {
  isValidIndiaCoordinate,
  detectState,
  validateCoordinateBatch,
  getNearestState,
  INDIA_BOUNDS,
  INDIA_MAINLAND_BOUNDS,
  STATE_BOUNDARIES
};
