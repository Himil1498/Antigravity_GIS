/**
 * Layer Management Constants
 */

const ERRORS = {
  LAYER_NOT_FOUND: 'Layer not found or access denied',
  FAILED_TO_GET_LAYERS: 'Failed to get layers',
  FAILED_TO_GET_LAYER: 'Failed to get layer',
  REQUIRED_FIELDS: 'Layer name, type, and data required',
  FAILED_TO_CREATE: 'Failed to create layer',
  NO_FIELDS_TO_UPDATE: 'No fields to update',
  FAILED_TO_UPDATE: 'Failed to update layer',
  FAILED_TO_DELETE: 'Failed to delete layer',
  FAILED_TO_TOGGLE: 'Failed to toggle visibility',
  USER_IDS_ARRAY: 'user_ids must be an array',
  FAILED_TO_SHARE: 'Failed to share layer'
};

const SUCCESS = {
  UPDATED: 'Layer updated successfully',
  DELETED: 'Layer deleted successfully',
  TOGGLED: 'Visibility toggled successfully',
  SHARED: 'Layer shared successfully'
};

module.exports = {
  ERRORS,
  SUCCESS
};
