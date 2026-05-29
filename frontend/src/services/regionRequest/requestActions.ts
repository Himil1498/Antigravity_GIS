/**
 * Region Request Actions
 * Approve, Reject, and Cancel operations
 */

import type { RegionAccessRequest } from '../../types/regionRequest.types';
import type { User } from "../../types/auth/index";
import { logAuditEvent } from "../audit/index";
import { apiClient } from "./apiClient";
import { getRegionRequests, deleteRegionRequest } from "./crudOperations";

/**
 * Approve a region access request
 */
export const approveRegionRequest = async (
  requestId: string,
  reviewedBy: User,
  reviewNotes?: string
): Promise<RegionAccessRequest | null> => {
  try {
    const response = await apiClient.patch<{
      success: boolean;
      message?: string;
      request?: any;
    }>(`/region-requests/${requestId}/approve`, {
      review_notes: reviewNotes,
    });

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || "Failed to approve region request");
    }

    // Fetch updated request
    const requests = await getRegionRequests();
    const request = requests.find((req) => req.id === requestId);

    if (request) {
      // Log audit event
      logAuditEvent(
        reviewedBy,
        "REGION_ASSIGNED",
        `Approved region request for ${request.userName}`,
        {
          severity: "info",
          details: {
            requestId,
            requestedRegions: request.requestedRegions,
            requestedBy: request.userName,
            reviewNotes,
          },
          success: true,
        }
      );
    }

    return request || null;
  } catch (error: any) {
    console.error("Error approving region request:", error);
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "Failed to approve region request"
    );
  }
};

/**
 * Reject a region access request
 */
export const rejectRegionRequest = async (
  requestId: string,
  reviewedBy: User,
  reviewNotes?: string
): Promise<RegionAccessRequest | null> => {
  try {
    const response = await apiClient.patch<{
      success: boolean;
      message?: string;
      request?: any;
    }>(`/region-requests/${requestId}/reject`, {
      review_notes: reviewNotes,
    });

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || "Failed to reject region request");
    }

    // Fetch updated request
    const requests = await getRegionRequests();
    const request = requests.find((req) => req.id === requestId);

    if (request) {
      // Log audit event
      logAuditEvent(
        reviewedBy,
        "REGION_REVOKED",
        `Rejected region request for ${request.userName}`,
        {
          severity: "warning",
          details: {
            requestId,
            requestedRegions: request.requestedRegions,
            requestedBy: request.userName,
            reviewNotes,
          },
          success: true,
        }
      );
    }

    return request || null;
  } catch (error: any) {
    console.error("Error rejecting region request:", error);
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "Failed to reject region request"
    );
  }
};

/**
 * Cancel a region access request (by the requester)
 */
export const cancelRegionRequest = async (
  requestId: string,
  user: User
): Promise<RegionAccessRequest | null> => {
  try {
    const success = await deleteRegionRequest(requestId, user);
    if (success) {
      return { id: requestId } as RegionAccessRequest;
    }
    return null;
  } catch (error) {
    console.error("Error cancelling region request:", error);
    return null;
  }
};


