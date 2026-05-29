// Access Control Constants
const ERRORS = {
  GRANT_FAILED: 'Failed to grant temporary access',
  GRANT_ADMIN_MANAGER_ONLY: 'Only admins and managers can grant temporary access',
  MISSING_FIELDS: 'Missing required fields',
  USER_NOT_FOUND: 'User not found',
  REGION_NOT_FOUND: 'Region not found',
  ALREADY_EXISTS: 'Active temporary access already exists for this user and region',
  REVOKE_FAILED: 'Failed to revoke temporary access',
  REVOKE_ADMIN_MANAGER_ONLY: 'Only admins and managers can revoke temporary access',
  ACCESS_NOT_FOUND: 'Temporary access grant not found',
  GET_FAILED: 'Failed to retrieve temporary access data',
  ADMIN_MANAGER_ONLY: 'Only admins and managers can view all temporary access',
  CLEANUP_FAILED: 'Failed to cleanup temporary access',
  CLEANUP_ADMIN_ONLY: 'Only admins can perform cleanup',
  
  // Permissions
  PERMISSION_NOT_FOUND: 'Permission not found',
  CREATE_FAILED: 'Failed to create permission',
  UPDATE_FAILED: 'Failed to update permission',
  DELETE_FAILED: 'Failed to delete permission',
  ASSIGN_FAILED: 'Failed to assign permission',
  REMOVE_FAILED: 'Failed to remove permission',
  FETCH_FAILED: 'Failed to fetch permissions'
};

const SUCCESS = {
  REVOKE_SUCCESS: 'Temporary access revoked successfully',
  CLEANUP_SUCCESS: 'Cleanup completed successfully'
};

module.exports = {
  ERRORS,
  SUCCESS
};
