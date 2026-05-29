
import { TemporaryAccessStats, TemporaryAccessFilter } from "./types";
import { getTemporaryAccess, getFilteredTemporaryAccess } from "./accessQueryService";

/**
 * Get temporary access statistics
 */
export const getTemporaryAccessStats = async (
  filter?: TemporaryAccessFilter
): Promise<TemporaryAccessStats> => {
  const grants = filter
    ? await getFilteredTemporaryAccess(filter)
    : await getTemporaryAccess();
  const now = new Date();

  const grantsByRegion: Record<string, number> = {};
  const grantsByUser: Record<string, number> = {};

  let activeGrants = 0;
  let expiredGrants = 0;
  let revokedGrants = 0;

  grants.forEach((grant) => {
    // Count by region
    grantsByRegion[grant.region] = (grantsByRegion[grant.region] || 0) + 1;

    // Count by user
    const userKey = `${grant.userName} (${grant.userEmail})`;
    grantsByUser[userKey] = (grantsByUser[userKey] || 0) + 1;

    // Count by status
    if (grant.revokedAt) {
      revokedGrants++;
    } else if (grant.expiresAt < now) {
      expiredGrants++;
    } else if (grant.isActive) {
      activeGrants++;
    }
  });

  return {
    totalGrants: grants.length,
    activeGrants,
    expiredGrants,
    revokedGrants,
    grantsByRegion,
    grantsByUser
  };
};

