/**
 * Feature Constants
 */

const ERRORS = {
  FEATURE_NOT_FOUND: 'Feature not found',
  NAME_TYPE_GEOMETRY_REQUIRED: 'Name, feature_type, and geometry are required',
  LAT_LNG_REQUIRED: 'Latitude and longitude required',
  NO_FIELDS_TO_UPDATE: 'No fields to update',
  ONLY_OWNER_OR_ADMIN_UPDATE: 'Only feature owner or admin can update',
  ONLY_OWNER_OR_ADMIN_DELETE: 'Only feature owner or admin can delete',
  NO_REGION_ACCESS: 'No access to this region',
  FAILED_TO_GET: 'Failed to get features',
  FAILED_TO_GET_FEATURE: 'Failed to get feature',
  FAILED_TO_CREATE: 'Failed to create feature',
  FAILED_TO_UPDATE: 'Failed to update feature',
  FAILED_TO_DELETE: 'Failed to delete feature',
  FAILED_TO_GET_NEARBY: 'Failed to get nearby features',
  FAILED_TO_GET_BY_REGION: 'Failed to get features by region'
};

const MESSAGES = {
  FEATURE_UPDATED: 'Feature updated successfully',
  FEATURE_DELETED: 'Feature deleted successfully'
};

const DEFAULT_RADIUS = 5000; // meters

module.exports = {
  ERRORS,
  MESSAGES,
  DEFAULT_RADIUS
};
