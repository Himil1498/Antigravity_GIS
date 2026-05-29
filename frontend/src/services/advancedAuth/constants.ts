/**
 * Advanced Auth Service Constants
 * Configuration and security settings
 */

export const AUTH_CONFIG = {
  // Storage keys
  ACCESS_TOKEN_KEY: "opti_access_token",
  REFRESH_TOKEN_KEY: "opti_refresh_token",
  USER_KEY: "opti_user_data",
  SESSION_KEY: "opti_session_id",
  PREFERENCES_KEY: "opti_user_preferences",

  // Token lifetimes
  ACCESS_TOKEN_LIFETIME: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_LIFETIME: 7 * 24 * 60 * 60 * 1000, // 7 days
  SESSION_CHECK_INTERVAL: 60 * 1000, // 1 minute

  // Security settings
  MAX_IDLE_TIME: 120 * 60 * 1000, // 2 hours of inactivity
  HEARTBEAT_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Activity tracking events
 */
export const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keypress",
  "scroll",
  "touchstart",
  "click",
] as const;

/**
 * Activity throttle delay (ms)
 */
export const ACTIVITY_THROTTLE_DELAY = 5000;

