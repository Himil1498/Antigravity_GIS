/**
 * Group Permission Constants
 */

const ERRORS = {
  GROUP_NOT_FOUND: 'Group not found',
  NOT_AUTHORIZED_VIEW_PERMISSIONS: 'Not authorized to view group permissions',
  NOT_AUTHORIZED_UPDATE_PERMISSIONS: 'Only group owner/admin can update permissions',
  NOT_AUTHORIZED_VIEW_REGIONS: 'Not authorized to view group regions',
  NOT_AUTHORIZED_UPDATE_REGIONS: 'Not authorized to update group regions',
  PERMISSIONS_MUST_BE_ARRAY: 'Permissions must be an array',
  REGION_IDS_MUST_BE_ARRAY: 'Region IDs must be an array',
  FAILED_TO_GET_PERMISSIONS: 'Failed to get group permissions',
  FAILED_TO_UPDATE_PERMISSIONS: 'Failed to update group permissions',
  FAILED_TO_GET_REGIONS: 'Failed to get group regions',
  FAILED_TO_UPDATE_REGIONS: 'Failed to update group regions'
};

const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member'
};

module.exports = {
  ERRORS,
  ROLES
};
