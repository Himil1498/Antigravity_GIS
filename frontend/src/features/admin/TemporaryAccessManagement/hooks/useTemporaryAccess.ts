/**
 * useTemporaryAccess - Custom hook for managing temporary access data and operations
 */

import { useTemporaryAccessData } from "./useTemporaryAccessData";
import {
  createGrantAccessHandler,
  createExtendHandler,
  createRevokeHandler,
  createDeleteHandler,
} from "./useTemporaryAccessActions";
import type { SimpleUser } from "../types/types";

export const useTemporaryAccess = (
  currentUser: any,
  filterUserId: string,
  filterRegion: string,
  filterStatus: "all" | "active" | "expired" | "revoked"
) => {
  const { grants, users, loading, setLoading, stats, expiringGrants, loadData } =
    useTemporaryAccessData(currentUser, filterUserId, filterRegion, filterStatus);

  return {
    grants,
    users,
    loading,
    setLoading,
    stats,
    expiringGrants,
    loadData
  };
};

// Re-export action handlers for existing consumers
export {
  createGrantAccessHandler,
  createExtendHandler,
  createRevokeHandler,
  createDeleteHandler,
};

