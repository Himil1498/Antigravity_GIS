/**
 * Generator module for reports and scripts
 */

/**
 * Generate SQL script to delete items with invalid coordinates
 * @param {Array} invalidItems - Array of invalid items from scan
 * @returns {string} SQL DELETE script
 */
function generateDeleteScript(invalidItems) {
  if (!invalidItems || invalidItems.length === 0) {
    return "-- No invalid items to delete\n";
  }

  const ids = invalidItems.map(item => item.id);

  return `-- Delete infrastructure items with invalid coordinates
-- Generated: ${new Date().toISOString()}
-- Total items to delete: ${ids.length}

-- BACKUP FIRST (optional but recommended)
CREATE TABLE IF NOT EXISTS infrastructure_items_backup_invalid AS
SELECT * FROM infrastructure_items
WHERE id IN (${ids.join(', ')});

-- DELETE invalid items
DELETE FROM infrastructure_items
WHERE id IN (${ids.join(', ')});

-- Verify deletion
SELECT COUNT(*) as deleted_count FROM infrastructure_items_backup_invalid;
`;
}

/**
 * Generate CSV report of invalid coordinates
 * @param {Array} invalidItems - Array of invalid items from scan
 * @returns {string} CSV content
 */
function generateCSVReport(invalidItems) {
  const headers = [
    'ID',
    'Name',
    'Type',
    'Latitude',
    'Longitude',
    'Address State',
    'Source',
    'Created At',
    'User ID',
    'Validation Error',
    'Nearest State',
    'Distance (km)',
    'Suggestion'
  ].join(',');

  const rows = invalidItems.map(item => [
    item.id,
    `"${item.name}"`,
    item.type,
    item.latitude,
    item.longitude,
    `"${item.addressState || ''}"`,
    item.source,
    item.createdAt,
    item.userId,
    `"${item.validationError}"`,
    item.nearestState,
    item.distanceKm,
    `"${item.suggestion}"`
  ].join(','));

  return [headers, ...rows].join('\n');
}

module.exports = {
  generateDeleteScript,
  generateCSVReport
};
