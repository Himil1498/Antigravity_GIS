
/**
 * Generate session ID
 */
export const generateSessionId = (): string => {
  return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get device info for connection
 */
export const getDeviceInfo = (): string => {
  return `${navigator.userAgent.substring(
    0,
    100
  )} | ${new Date().toISOString()}`;
};

