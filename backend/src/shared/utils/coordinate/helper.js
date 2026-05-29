const { STATE_BOUNDARIES } = require('./constants');

/**
 * Get nearest state for invalid coordinates (for debugging/correction)
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Object} { state: string, distance: number, suggestion: string }
 */
function getNearestState(latitude, longitude) {
  let nearestState = null;
  let minDistance = Infinity;

  STATE_BOUNDARIES.forEach((state) => {
    // Calculate distance to center of state
    const stateCenterLat = (state.latMin + state.latMax) / 2;
    const stateCenterLng = (state.lngMin + state.lngMax) / 2;

    // Simple Euclidean distance (good enough for proximity check)
    const distance = Math.sqrt(
      Math.pow(latitude - stateCenterLat, 2) +
      Math.pow(longitude - stateCenterLng, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestState = state;
    }
  });

  // Approximate conversion to km (very rough, 1 degree ≈ 111km)
  const distanceKm = Math.round(minDistance * 111);

  return {
    state: nearestState.name,
    distance: distanceKm,
    suggestion: `Coordinates might be ${distanceKm}km from ${nearestState.name}. Check if coordinates are in correct format.`
  };
}

module.exports = {
  getNearestState
};
