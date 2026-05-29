const { pool } = require('../../src/config/database');

/**
 * Auto-detect region from coordinates
 */
const detectRegionFromCoordinates = async (lat, lng) => {
  try {
    const regionMappings = [
      { name: 'Gujarat', latMin: 20.0, latMax: 24.7, lngMin: 68.0, lngMax: 74.5 },
      { name: 'Maharashtra', latMin: 15.6, latMax: 22.0, lngMin: 72.6, lngMax: 80.9 },
      { name: 'Rajasthan', latMin: 23.0, latMax: 30.2, lngMin: 69.5, lngMax: 78.3 },
      { name: 'Odisha', latMin: 17.8, latMax: 22.6, lngMin: 81.3, lngMax: 87.5 },
      { name: 'West Bengal', latMin: 21.5, latMax: 27.2, lngMin: 85.8, lngMax: 89.9 },
      { name: 'Uttar Pradesh', latMin: 23.9, latMax: 30.4, lngMin: 77.1, lngMax: 84.6 },
      { name: 'Karnataka', latMin: 11.5, latMax: 18.5, lngMin: 74.0, lngMax: 78.6 },
      { name: 'Tamil Nadu', latMin: 8.1, latMax: 13.6, lngMin: 76.2, lngMax: 80.3 }
    ];

    for (const region of regionMappings) {
      if (lat >= region.latMin && lat <= region.latMax &&
          lng >= region.lngMin && lng <= region.lngMax) {
        const [regions] = await pool.query(
          'SELECT id FROM regions WHERE name = ? AND is_active = TRUE LIMIT 1',
          [region.name]
        );
        if (regions.length > 0) {
          return regions[0].id;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error detecting region:', error);
    return null;
  }
};

module.exports = {
  detectRegionFromCoordinates
};
