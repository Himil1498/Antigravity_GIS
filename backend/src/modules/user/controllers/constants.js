const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  FAILED_GET_USERS: 'Failed to get users',
  FAILED_GET_USER: 'Failed to get user',
  REQUIRED_FIELDS_MISSING: 'Required fields missing',
  USER_ALREADY_EXISTS: 'User already exists',
  FAILED_CREATE_USER: 'Failed to create user',
  NOT_AUTHORIZED: 'Not authorized',
  USERNAME_IN_USE: 'Username already in use',
  EMAIL_IN_USE: 'Email already in use',
  NO_FIELDS_TO_UPDATE: 'No fields to update',
  FAILED_UPDATE_USER: 'Failed to update user',
  CANNOT_DELETE_SELF: 'Cannot delete yourself',
  FAILED_DELETE_USER: 'Failed to delete user',
  REGION_CREATE_FAILED: 'Failed to create region'
};

const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully. Verification email has been sent.',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully'
};

const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  REGION_REQUEST: 'region_request',
  USER_ACTIVITY: 'user_activity'
};

module.exports = {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  AUDIT_ACTIONS
};
