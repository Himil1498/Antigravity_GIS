/**
 * Region Request Service - Barrel Exports
 * Clean public API for region request operations
 */

// CRUD Operations
export {
  createRegionRequest,
  getRegionRequests,
  getUserRegionRequests,
  getFilteredRegionRequests,
  deleteRegionRequest,
} from "./crudOperations";

// Request Actions
export {
  approveRegionRequest,
  rejectRegionRequest,
  cancelRegionRequest,
} from "./requestActions";

// Query Utilities
export {
  getRegionRequestStats,
  getPendingRequestsCount,
  hasPendingRequestForRegion,
} from "./queryUtils";

// Constants (if needed by consumers)
export { BACKEND_API_URL, STORAGE_KEY } from "./constants";

