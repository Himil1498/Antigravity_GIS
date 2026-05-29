/**
 * Region Request Query Utilities
 * Statistics, counts, and helper functions
 */

import type {
  RegionAccessRequest,
  RegionAccessRequestFilter,
  RegionRequestStats,
} from '../../types/regionRequest.types';
import { getRegionRequests, getFilteredRegionRequests } from "./crudOperations";

/**
 * Get region request statistics
 */
export const getRegionRequestStats = async (
  filter?: RegionAccessRequestFilter
): Promise<RegionRequestStats> => {
  const requests = filter
    ? await getFilteredRegionRequests(filter)
    : await getRegionRequests();

  const requestsByUser: Record<string, number> = {};
  const requestsByRegion: Record<string, number> = {};

  let pendingRequests = 0;
  let approvedRequests = 0;
  let rejectedRequests = 0;

  requests.forEach((req) => {
    // Count by user
    const userKey = `${req.userName} (${req.userEmail})`;
    requestsByUser[userKey] = (requestsByUser[userKey] || 0) + 1;

    // Count by region
    req.requestedRegions.forEach((region: string) => {
      requestsByRegion[region] = (requestsByRegion[region] || 0) + 1;
    });

    // Count by status
    if (req.status === "pending") pendingRequests++;
    else if (req.status === "approved") approvedRequests++;
    else if (req.status === "rejected") rejectedRequests++;
  });

  return {
    totalRequests: requests.length,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    requestsByUser,
    requestsByRegion,
  };
};

/**
 * Get pending requests count for a user
 */
export const getPendingRequestsCount = async (
  userId: string
): Promise<number> => {
  const requests = await getFilteredRegionRequests({
    userId,
    status: "pending",
  });
  return requests.length;
};

/**
 * Check if user has pending request for a region
 */
export const hasPendingRequestForRegion = async (
  userId: string,
  region: string
): Promise<boolean> => {
  const pendingRequests = await getFilteredRegionRequests({
    userId,
    status: "pending",
  });
  return pendingRequests.some((req) => req.requestedRegions.includes(region));
};

