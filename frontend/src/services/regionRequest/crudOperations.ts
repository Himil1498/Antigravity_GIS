/**
 * Region Request CRUD Operations
 * Create, Read, Update, Delete operations for region requests
 */

import type {
  RegionAccessRequest,
  RegionRequestStatus,
  RegionAccessRequestFilter,
} from '../../types/regionRequest.types';
import type { User } from "../../types/auth/index";
import { logAuditEvent } from "../audit/index";
import { apiClient } from "./apiClient";

/**
 * Create a new region access request
 */
export const createRegionRequest = async (
  user: User,
  requestedRegions: string[],
  reason: string
): Promise<RegionAccessRequest> => {
  try {
    // Backend expects single region per request, so we'll create for the first region
    const region = requestedRegions[0];

    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      request: any;
    }>("/region-requests", {
      region_name: region,
      request_type: "access",
      comments: reason,
    });

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || "Failed to create region request");
    }

    const backendRequest = data.request;

    const request: RegionAccessRequest = {
      id: backendRequest.id.toString(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      requestedRegions,
      reason: backendRequest.reason,
      status: backendRequest.status,
      createdAt: new Date(backendRequest.created_at || Date.now()),
      updatedAt: new Date(backendRequest.updated_at || Date.now()),
    };

    // Log audit event
    logAuditEvent(
      user,
      "REGION_ACCESS_DENIED",
      `Requested access to ${requestedRegions.join(", ")}`,
      {
        severity: "info",
        details: { requestedRegions, reason, requestId: request.id },
        success: true,
      }
    );

    return request;
  } catch (error: any) {
    console.error("Error creating region request:", error);
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "Failed to create region request"
    );
  }
};

/**
 * Get all region access requests
 */
export const getRegionRequests = async (
  status?: string
): Promise<RegionAccessRequest[]> => {
  try {
    const params: any = {};
    if (status) params.status = status;

    const response = await apiClient.get<{
      success: boolean;
      message?: string;
      requests: any[];
    }>("/region-requests", { params });

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch region requests");
    }

    const requests = data.requests.map((req: any) => ({
      id: req.id.toString(),
      userId: `OCGID${String(req.user_id).padStart(3, "0")}`,
      userName: req.full_name || req.username || "",
      userEmail: req.email || "",
      userRole: req.role || "User",
      requestedRegions: [req.region_name],
      reason: req.comments || req.reason || "",
      status: req.status as RegionRequestStatus,
      createdAt: new Date(req.requested_at || req.created_at),
      updatedAt: new Date(req.updated_at || req.requested_at || req.created_at),
      reviewedAt: req.reviewed_at ? new Date(req.reviewed_at) : undefined,
      reviewedBy: req.reviewed_by
        ? `OCGID${String(req.reviewed_by).padStart(3, "0")}`
        : undefined,
      reviewedByName: req.reviewer_name || req.reviewed_by_name || undefined,
      reviewNotes: req.comments || req.review_notes || undefined,
    }));

    return requests;
  } catch (error: any) {
    console.error("Error fetching region requests from backend:", error);
    return [];
  }
};

/**
 * Get region requests for a specific user
 */
export const getUserRegionRequests = async (
  userId: string
): Promise<RegionAccessRequest[]> => {
  const requests = await getRegionRequests();
  return requests.filter((req) => req.userId === userId);
};

/**
 * Get filtered region requests
 */
export const getFilteredRegionRequests = async (
  filter: RegionAccessRequestFilter
): Promise<RegionAccessRequest[]> => {
  const requests = await getRegionRequests(filter.status);

  return requests.filter((req) => {
    if (filter.userId && req.userId !== filter.userId) {
      return false;
    }

    if (filter.region && !req.requestedRegions.includes(filter.region)) {
      return false;
    }

    return true;
  });
};

/**
 * Delete a region request
 */
export const deleteRegionRequest = async (
  requestId: string,
  user: User
): Promise<boolean> => {
  try {
    // Delete from backend database — backend handles permission checks via JWT
    const response = await apiClient.delete<{
      success: boolean;
      message?: string;
    }>(`/region-requests/${requestId}`);

    const data = response.data;
    if (!data.success) {
      throw new Error(data.message || "Failed to delete region request");
    }

    // Log audit event
    logAuditEvent(user, "REGION_ACCESS_DENIED", `Deleted region access request`, {
      severity: "info",
      details: { requestId },
      success: true,
    });

    return true;
  } catch (error: any) {
    console.error("Error deleting region request:", error);
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "Failed to delete region request"
    );
  }
};


