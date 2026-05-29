/**
 * WebSocket Constants
 */

module.exports = {
  // Event Types
  EVENTS: {
    CONNECTION: "connection",
    MESSAGE: "message",
    CLOSE: "close",
    ERROR: "error",
    CONNECTED: "connected",
    HEARTBEAT: "heartbeat",
    FORCE_LOGOUT: "force_logout",
    SESSION_EXPIRED: "user_session_expired",
    GIS_DATA_UPDATED: "gis_data_updated",
    BOUNDARY_PUBLISHED: "boundary_published",
  },

  // Message Types
  MESSAGE_TYPES: {
    SYSTEM: "system",
    PING: "ping",
    PONG: "pong",
  },

  // Error Codes
  ERRORS: {
    AUTH_REQUIRED: 4001,
    INVALID_TOKEN: 4002,
    FORCE_LOGOUT: 1000,
  },

  // Error Messages
  ERROR_MESSAGES: {
    AUTH_REQUIRED: "Authentication required",
    INVALID_TOKEN: "Invalid token",
    FORCE_LOGOUT_ADMIN: "Force logout by admin",
  },
};
