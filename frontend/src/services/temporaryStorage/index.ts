
/**
 * Temporary Storage Service Module
 *
 * Manages temporary GIS tool data that expires after 24 hours or on logout.
 * Split into modular sub-services.
 */

export * from "./temporaryStorageService";
export * from "./types";
// Export specific sub-services if needed directly, but orchestrator covers public API

