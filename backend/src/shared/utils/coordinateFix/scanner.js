/**
 * Scanner module for detecting invalid coordinates
 */
const { pool } = require("../../../config/database");
const {
  isValidIndiaCoordinate,
  detectState,
  getNearestState
} = require("../coordinate/index");

/**
 * Scan database for items with invalid coordinates
 * @returns {Promise<Object>} Report of invalid items
 */
async function scanInvalidCoordinates() {
  try {
    console.log("🔍 Scanning database for invalid coordinates...");

    // Get all infrastructure items with coordinates
    const [items] = await pool.query(`
      SELECT
        id,
        item_name,
        item_type,
        latitude,
        longitude,
        region_id,
        address_state,
        source,
        created_at,
        user_id
      FROM infrastructure_items
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      ORDER BY created_at DESC
    `);

    const invalid = [];
    const missingRegion = [];
    const validWithRegion = [];

    for (const item of items) {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);

      // Check if coordinates are valid
      const validation = isValidIndiaCoordinate(lat, lng);

      if (!validation.valid) {
        // Invalid coordinates
        const nearest = getNearestState(lat, lng);
        invalid.push({
          id: item.id,
          name: item.item_name,
          type: item.item_type,
          latitude: lat,
          longitude: lng,
          regionId: item.region_id,
          addressState: item.address_state,
          source: item.source,
          createdAt: item.created_at,
          userId: item.user_id,
          validationError: validation.error,
          nearestState: nearest.state,
          distanceKm: nearest.distance,
          suggestion: nearest.suggestion
        });
      } else {
        // Valid coordinates
        const stateDetection = detectState(lat, lng);

        if (!item.region_id) {
          // Valid but missing region_id
          missingRegion.push({
            id: item.id,
            name: item.item_name,
            type: item.item_type,
            latitude: lat,
            longitude: lng,
            detectedState: stateDetection.state,
            addressState: item.address_state,
            source: item.source,
            createdAt: item.created_at,
            userId: item.user_id
          });
        } else {
          validWithRegion.push(item);
        }
      }
    }

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: items.length,
        invalid: invalid.length,
        missingRegion: missingRegion.length,
        validWithRegion: validWithRegion.length,
        invalidPercentage: ((invalid.length / items.length) * 100).toFixed(2),
        missingRegionPercentage: ((missingRegion.length / items.length) * 100).toFixed(2)
      },
      details: {
        invalidCoordinates: invalid,
        missingRegionId: missingRegion
      }
    };

    console.log("📊 Scan Complete:");
    console.log(`   Total items: ${report.summary.total}`);
    console.log(`   Invalid coordinates: ${report.summary.invalid} (${report.summary.invalidPercentage}%)`);
    console.log(`   Missing region_id: ${report.summary.missingRegion} (${report.summary.missingRegionPercentage}%)`);
    console.log(`   Valid with region: ${report.summary.validWithRegion.length}`); // Fixed: accessing length since validWithRegion is an array

    return report;
  } catch (error) {
    console.error("Error scanning coordinates:", error);
    throw error;
  }
}

module.exports = {
  scanInvalidCoordinates
};
