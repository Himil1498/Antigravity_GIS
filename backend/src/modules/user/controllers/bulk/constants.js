const AUDIT_ACTIONS = {
  BULK_DELETE: 'BULK_DELETE',
  BULK_STATUS_UPDATE: 'BULK_STATUS_UPDATE',
  REGION_REQUEST: 'region_request'
};

const ERROR_MESSAGES = {
  USER_IDS_REQUIRED: 'User IDs array required',
  CANNOT_DELETE_SELF: 'Cannot delete yourself',
  CANNOT_DEACTIVATE_SELF: 'Cannot deactivate yourself',
  IS_ACTIVE_BOOLEAN: 'is_active must be a boolean',
  REGION_NAMES_REQUIRED: 'Region names array required',
  BULK_DELETE_FAILED: 'Failed to bulk delete users',
  BULK_STATUS_FAILED: 'Failed to bulk update status',
  BULK_ASSIGN_FAILED: 'Failed to bulk assign regions'
};

module.exports = {
  AUDIT_ACTIONS,
  ERROR_MESSAGES
};
