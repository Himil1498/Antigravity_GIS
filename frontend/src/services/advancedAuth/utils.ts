/**
 * Advanced Auth Utilities
 * Helper functions shared across auth services
 */

/**
 * Generate a unique session identifier
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Capture lightweight device information for session metadata
 */
export function getDeviceInfo(): string {
  return `${navigator.userAgent.split(" ")[0]} | ${navigator.platform}`;
}


