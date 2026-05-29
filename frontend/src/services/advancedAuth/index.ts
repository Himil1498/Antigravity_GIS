/**
 * Advanced Auth Service - Barrel Exports
 * Clean public API for advanced authentication
 */

export { advancedAuthService, default } from "./advancedAuthService";
export { AdvancedAuthDataService } from "./advancedAuthDataService";
export { AdvancedAuthValidationService } from "./advancedAuthValidationService";
export {
  AUTH_CONFIG,
  ACTIVITY_EVENTS,
  ACTIVITY_THROTTLE_DELAY,
} from "./constants";
export type {
  AuthSession,
  AuthStateListener,
  SessionEndListener,
  SessionInfo,
} from "./types";
export { generateSessionId, getDeviceInfo } from "./utils";

