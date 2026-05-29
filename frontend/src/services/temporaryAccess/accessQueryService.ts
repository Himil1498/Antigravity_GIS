
import { apiClient } from "../api/client";
import { TemporaryRegionAccess, TemporaryAccessFilter } from "./types";
import { getTemporaryAccessFromLocal } from "./utils";

/**
 * Get all temporary access grants
 */
export const getTemporaryAccess = async (): Promise<TemporaryRegionAccess[]> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      message?: string;
      access: any[];
    }>("/temporary-access");

    const data = response.data as {
      success: boolean;
      message?: string;
      access: any[];
    };
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch temporary access");
    }

    const grants = data.access.map((grant: any) => {
      // Determine if grant is active
      const isActive =
        !grant.revoked_at && new Date(grant.expires_at) > new Date();

      return {
        id: grant.id.toString(),
        userId: `OCGID${String(grant.user_id).padStart(3, "0")}`,
        userName: grant.full_name || grant.user_name || "",
        userEmail: grant.email || grant.user_email || "",
        region: grant.region_name,
        grantedBy: `OCGID${String(grant.granted_by).padStart(3, "0")}`,
        grantedByName: grant.granted_by_username || grant.granted_by_name || "",
        grantedAt: new Date(grant.granted_at),
        expiresAt: new Date(grant.expires_at),
        reason: grant.reason || "",
        isActive,
        revokedAt: grant.revoked_at ? new Date(grant.revoked_at) : undefined,
        revokedBy: grant.revoked_by
          ? `OCGID${String(grant.revoked_by).padStart(3, "0")}`
          : undefined,
        revokedByName: grant.revoked_by_name || undefined,
        revokedReason: grant.revoked_reason || undefined,
        timeRemaining: grant.time_remaining || null
      };
    });

    return grants;
  } catch (error: any) {
    console.error("Error fetching temporary access from backend:", error);
    throw error;
  }
};

/**
 * Get current user's active temporary access (from their perspective)
 */
export const getMyActiveTemporaryAccess = async (): Promise<TemporaryRegionAccess[]> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      message?: string;
      access: any[];
      count: number;
    }>("/temporary-access/my-access");

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch your temporary access");
    }

    const grants = data.access.map((grant: any) => ({
      id: grant.id.toString(),
      userId: `OCGID${String(grant.user_id).padStart(3, "0")}`,
      userName: grant.full_name || "",
      userEmail: grant.email || "",
      region: grant.region_name,
      grantedBy: `OCGID${String(grant.granted_by).padStart(3, "0")}`,
      grantedByName: grant.granted_by_name || grant.granted_by_username || "",
      grantedAt: new Date(grant.granted_at),
      expiresAt: new Date(grant.expires_at),
      reason: grant.reason || "",
      isActive: true, // This endpoint only returns active grants
      timeRemaining: grant.time_remaining || null
    }));

    return grants;
  } catch (error: any) {
    console.error("Error fetching my temporary access from backend:", error);
    return [];
  }
};

/**
 * Get active temporary access for a user
 */
export const getActiveTemporaryAccess = async (
  userId: string
): Promise<TemporaryRegionAccess[]> => {
  const grants = await getTemporaryAccess();
  const now = new Date();

  return grants.filter(
    (grant) =>
      grant.userId === userId &&
      grant.isActive &&
      grant.expiresAt > now &&
      !grant.revokedAt
  );
};

/**
 * Get all regions a user has temporary access to (including expired/revoked for history)
 */
export const getUserTemporaryRegions = async (
  userId: string
): Promise<string[]> => {
  const activeGrants = await getActiveTemporaryAccess(userId);
  return activeGrants.map((grant) => grant.region);
};

/**
 * Check if user has temporary access to a region
 */
export const hasTemporaryAccess = async (
  userId: string,
  region: string
): Promise<boolean> => {
  try {
    // Use user-specific endpoint (works for all roles)
    const grants = await getMyActiveTemporaryAccess();
    return grants.some((grant) => grant.region === region);
  } catch (error) {
    console.error("Error checking temporary access:", error);
    return false; // Return false on error instead of throwing
  }
};

/**
 * Get filtered temporary access grants
 */
export const getFilteredTemporaryAccess = async (
  filter: TemporaryAccessFilter
): Promise<TemporaryRegionAccess[]> => {
  const grants = await getTemporaryAccess();
  const now = new Date();

  return grants.filter((grant) => {
    // Filter by user
    if (filter.userId && grant.userId !== filter.userId) {
      return false;
    }

    // Filter by region
    if (filter.region && grant.region !== filter.region) {
      return false;
    }

    // Filter by granted by
    if (filter.grantedBy && grant.grantedBy !== filter.grantedBy) {
      return false;
    }

    // Filter by active status
    if (filter.isActive !== undefined) {
      const isCurrentlyActive =
        grant.isActive && grant.expiresAt > now && !grant.revokedAt;
      if (filter.isActive !== isCurrentlyActive) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Get expiring grants (within next N days)
 */
export const getExpiringGrants = async (
  daysAhead: number = 7
): Promise<TemporaryRegionAccess[]> => {
  const grants = await getTemporaryAccess();
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return grants.filter(
    (grant) =>
      grant.isActive &&
      !grant.revokedAt &&
      grant.expiresAt > now &&
      grant.expiresAt <= futureDate
  );
};

