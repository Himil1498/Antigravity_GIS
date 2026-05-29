
import { STORAGE_KEY } from "./constants";
import { TemporaryRegionAccess } from "./types";

/**
 * Save grants to localStorage
 */
export const saveGrants = (grants: TemporaryRegionAccess[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(grants));
  } catch (error) {
    console.error("Failed to save temporary access grants:", error);
  }
};

/**
 * Get all temporary access grants from localStorage (helper function)
 */
export const getTemporaryAccessFromLocal = (): TemporaryRegionAccess[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const grants = JSON.parse(data);
    // Convert date strings back to Date objects
    return grants.map((grant: any) => ({
      ...grant,
      grantedAt: new Date(grant.grantedAt),
      expiresAt: new Date(grant.expiresAt),
      revokedAt: grant.revokedAt ? new Date(grant.revokedAt) : undefined
    }));
  } catch (error) {
    console.error("Failed to load temporary access grants:", error);
    return [];
  }
};

