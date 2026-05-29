import {
  grantTemporaryAccess,
  revokeTemporaryAccess,
  extendTemporaryAccess,
  deleteTemporaryGrant,
} from "../../../../services/temporaryAccess/index";
import { showToast, toastMessages } from "../../../../utils/toastUtils";
import type { TemporaryRegionAccess } from "../../../../types/temporaryAccess.types";
import type { SimpleUser } from "../types/types";

type Notify = (
  type: "success" | "error" | "warning" | "info",
  title: string,
  message: string,
) => void;

export const createGrantAccessHandler = (
  users: SimpleUser[],
  currentUser: any,
  loadData: () => Promise<void>,
  setLoading: (loading: boolean) => void,
  showNotification: Notify,
) => {
  return async (
    selectedUserId: string,
    selectedRegion: string,
    expirationDate: string,
    reason: string,
    resetForm: () => void,
  ) => {
    if (!selectedUserId || !selectedRegion || !expirationDate || !reason) {
      showNotification(
        "error",
        "Validation Error",
        "Please fill in all required fields.",
      );
      return;
    }

    const targetUser = users.find((u) => u.id === selectedUserId);
    if (!targetUser) {
      showNotification("error", "Error", "Selected user not found.");
      return;
    }

    if (!currentUser) {
      showNotification("error", "Error", "User not authenticated.");
      return;
    }

    const expiresAt = new Date(expirationDate);
    if (expiresAt <= new Date()) {
      showNotification(
        "error",
        "Validation Error",
        "Expiration date must be in the future.",
      );
      return;
    }

    setLoading(true);
    try {
      await grantTemporaryAccess(
        targetUser as any,
        selectedRegion,
        expiresAt,
        reason,
        currentUser,
      );
      showToast.success(toastMessages.access.temporaryGranted);

      window.dispatchEvent(
        new CustomEvent("userRegionsUpdated", {
          detail: {
            userIds: [selectedUserId],
            regions: [selectedRegion],
            action: "temporary_grant",
          },
        }),
      );

      resetForm();
      await loadData();
    } catch (error) {
      showNotification("error", "Error", "Failed to grant temporary access.");
    } finally {
      setLoading(false);
    }
  };
};

export const createExtendHandler = (
  currentUser: any,
  loadData: () => Promise<void>,
  setLoading: (loading: boolean) => void,
  showNotification: Notify,
) => {
  return async (grantId: string | number, newExpirationDate: string) => {
    if (!currentUser) {
      showNotification("error", "Error", "User not authenticated.");
      return;
    }

    const newExpiration = new Date(newExpirationDate);
    if (newExpiration <= new Date()) {
      showNotification(
        "error",
        "Validation Error",
        "New expiration date must be in the future.",
      );
      return;
    }

    setLoading(true);
    try {
      await extendTemporaryAccess(String(grantId), newExpiration, currentUser);
      showNotification(
        "success",
        "Access Extended",
        `Temporary access extended to ${newExpiration.toLocaleDateString()}.`,
      );
      await loadData();
    } catch (error) {
      showNotification("error", "Error", "Failed to extend temporary access.");
    } finally {
      setLoading(false);
    }
  };
};

export const createRevokeHandler = (
  currentUser: any,
  loadData: () => Promise<void>,
  setLoading: (loading: boolean) => void,
  showNotification: Notify,
) => {
  return async (grant: TemporaryRegionAccess, revokeReason?: string) => {
    if (!currentUser) {
      showNotification("error", "Error", "User not authenticated.");
      return;
    }

    setLoading(true);
    try {
      await revokeTemporaryAccess(
        grant.id,
        currentUser,
        revokeReason || undefined,
      );
      showToast.success(toastMessages.access.temporaryRevoked);

      window.dispatchEvent(
        new CustomEvent("userRegionsUpdated", {
          detail: {
            userIds: [grant.userId],
            regions: [grant.region],
            action: "temporary_revoke",
          },
        }),
      );

      await loadData();
    } catch (error) {
      showNotification("error", "Error", "Failed to revoke temporary access.");
    } finally {
      setLoading(false);
    }
  };
};

export const createDeleteHandler = (
  currentUser: any,
  loadData: () => Promise<void>,
  setLoading: (loading: boolean) => void,
  showNotification: Notify,
) => {
  return async (grantId: string | number) => {
    if (!currentUser) {
      showNotification("error", "Error", "User not authenticated.");
      return;
    }

    setLoading(true);
    try {
      await deleteTemporaryGrant(String(grantId), currentUser);
      showNotification(
        "success",
        "Grant Deleted",
        "Temporary access grant deleted successfully from database.",
      );
      await loadData();
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to delete temporary access grant";
      showNotification("error", "Delete Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };
};
