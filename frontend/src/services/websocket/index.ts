
import websocketService from "./websocketService";

/**
 * WebSocket Service Module
 * 
 * Manages WebSocket connections, subscriptions, and global messaging.
 * Split into modular sub-services.
 */

export * from "./websocketService";
export * from "./types";
export { generateSessionId, getDeviceInfo } from "./utils";

// Default export for backward compatibility
export default websocketService;

