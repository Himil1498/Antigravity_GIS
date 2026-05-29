/**
 * Analyzer module for analyzing and fixing coordinate issues
 */
const { pool } = require("../../../config/database");
const { scanInvalidCoordinates } = require("./scanner");

/**
 * Analyze coordinate issues by source
 * @param {Array} invalidItems - Array of invalid items
 * @returns {Object} Analysis by source
 */
function analyzeBySource(invalidItems) {
  const bySource = {};

  invalidItems.forEach(item => {
    const source = item.source || 'Unknown';
    if (!bySource[source]) {
      bySource[source] = {
        count: 0,
        items: []
      };
    }
    bySource[source].count++;
    bySource[source].items.push(item);
  });

  return bySource;
}

/**
 * Suggest coordinate corrections based on address
 * @param {Object} item - Infrastructure item
 * @returns {Object} Suggestion
 */
async function suggestCorrection(item) {
  // If address_state is present, try to find typical coordinates for that state
  if (item.addressState) {
    const [stateRegion] = await pool.query(
      "SELECT id, name FROM regions WHERE name = ? AND is_active = TRUE LIMIT 1",
      [item.addressState]
    );

    if (stateRegion.length > 0) {
      return {
        suggestion: `Item has address_state "${item.addressState}". Consider geocoding the full address or using the state center.`,
        suggestedRegionId: stateRegion[0].id
      };
    }
  }

  return {
    suggestion: "No address information available. Manual correction required.",
    suggestedRegionId: null
  };
}

/**
 * Generate comprehensive fix report
 * @returns {Promise<Object>} Complete report with fix suggestions
 */
async function generateFixReport() {
  console.log("📋 Generating comprehensive coordinate fix report...");

  const scanResult = await scanInvalidCoordinates();
  const bySource = analyzeBySource(scanResult.details.invalidCoordinates);

  // Generate correction suggestions
  const suggestions = [];
  for (const item of scanResult.details.invalidCoordinates.slice(0, 20)) {
    const correction = await suggestCorrection(item);
    suggestions.push({
      ...item,
      correction
    });
  }

  const report = {
    ...scanResult,
    analysis: {
      bySource,
      topIssues: suggestions
    },
    recommendations: {
      immediate: [
        "1. Run the SQL script to update region_id for valid coordinates",
        "2. Review and delete items with coordinates outside India bounds",
        "3. Contact data source providers about coordinate accuracy"
      ],
      preventive: [
        "1. Enable coordinate validation on import",
        "2. Add geocoding for address-based entries",
        "3. Implement coordinate verification in UI"
      ]
    }
  };

  return report;
}

module.exports = {
  analyzeBySource,
  suggestCorrection,
  generateFixReport
};
