
/**
 * User Service Orchestrator
 * Re-exports all functionality from focused sub-services.
 * Maintains backward compatibility with the original monolithic service.
 */

// Re-export Data Operations
export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  searchUsers,
  getUserActivity
} from './userDataService';

// Re-export Bulk Operations
export {
  bulkCreateUsers,
  bulkDeleteUsers,
  bulkUpdateStatus,
  bulkAssignRegions
} from './userBulkService';

// Re-export Verification & MFA Operations
export {
  manualVerifyUserEmail,
  resendVerificationEmail,
  adminForce2FA,
  adminDisable2FA
} from './userVerificationService';

// Re-export Utility Types and Helpers if needed explicitly, 
// though consumers should mostly care about the functions above.
export type { BackendUser } from './types';

