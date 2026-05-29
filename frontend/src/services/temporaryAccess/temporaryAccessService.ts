
// Main orchestrator for Temporary Access Service
// Re-exports functionality from sub-services

export * from "./types";
export * from "./constants";
export * from "./utils"; // Some utils might be used directly

// Service exports
export {
  grantTemporaryAccess,
  revokeTemporaryAccess,
  cleanupExpiredGrants,
  extendTemporaryAccess,
  deleteTemporaryGrant
} from "./accessControlService";

export {
  getTemporaryAccess,
  getMyActiveTemporaryAccess,
  getActiveTemporaryAccess,
  getUserTemporaryRegions,
  hasTemporaryAccess,
  getFilteredTemporaryAccess,
  getExpiringGrants
} from "./accessQueryService";

export { getTemporaryAccessStats } from "./accessStatsService";

