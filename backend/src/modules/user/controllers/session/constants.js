const ERROR_MESSAGES = {
  FAILED_GET_STATS: 'Failed to get session statistics',
  USER_NOT_FOUND: 'User not found',
  FAILED_FORCE_LOGOUT: 'Failed to force logout user',
  USER_ID_MSG_REQUIRED: 'User ID and message are required',
  FAILED_SEND_MESSAGE: 'Failed to send message',
  FAILED_GET_ACTIVITY: 'Failed to get user activity'
};

const SUCCESS_MESSAGES = {
  LOGOUT_SUCCESS: (count, username) => `Successfully logged out ${count} active session(s) for ${username}`,
  MESSAGE_SENT: (name) => `Message sent successfully to ${name}`
};

const AUDIT_ACTIONS = {
  FORCE_LOGOUT: 'FORCE_LOGOUT',
  SEND_MESSAGE: 'SEND_MESSAGE'
};

const NOTIFICATION_TYPES = {
  SECURITY_ALERT: 'security_alert',
  USER_ACTIVITY: 'user_activity'
};

module.exports = {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  AUDIT_ACTIONS,
  NOTIFICATION_TYPES
};
