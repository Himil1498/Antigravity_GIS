/**
 * Password Reset Request Service
 * Handles all password reset request-related API calls
 */

import axios from "axios";

const BACKEND_API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:82/api";

const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add authorization header interceptor
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("opti_connect_token") || localStorage.getItem("opti_connect_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Password reset request type
export interface PasswordResetRequest {
  id: number;
  user_id: number | null;
  username_or_email: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "completed";
  requested_at: string;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_note: string | null;
  ip_address: string | null;
  user_agent: string | null;
  // Joined data from users table
  username?: string;
  email?: string;
  full_name?: string;
  is_active?: boolean;
  reviewer_username?: string;
  reviewer_name?: string;
}

/**
 * Submit password reset request (PUBLIC - no auth required)
 */
export const submitPasswordResetRequest = async (
  username: string,
  reason?: string,
): Promise<void> => {
  try {
    // Use regular axios for public endpoint
    await axios.post(`${BACKEND_API_URL}/password-reset-requests`, {
      username,
      reason,
    });
  } catch (error) {
    console.error("Error submitting password reset request:", error);
    throw error;
  }
};

/**
 * Get all password reset requests (Admin only)
 */
export const getAllPasswordResetRequests = async (
  status: string = "all",
): Promise<PasswordResetRequest[]> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      requests: PasswordResetRequest[];
    }>("/password-reset-requests", {
      params: { status },
    });
    return response.data.requests;
  } catch (error) {
    console.error("Error fetching password reset requests:", error);
    throw error;
  }
};

/**
 * Get single password reset request by ID (Admin only)
 */
export const getPasswordResetRequestById = async (
  id: number,
): Promise<PasswordResetRequest> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      request: PasswordResetRequest;
    }>(`/password-reset-requests/${id}`);
    return response.data.request;
  } catch (error) {
    console.error("Error fetching password reset request:", error);
    throw error;
  }
};

/**
 * Approve password reset request and set new password (Admin only)
 */
export const approvePasswordResetRequest = async (
  id: number,
  newPassword: string,
  note?: string,
): Promise<void> => {
  try {
    await apiClient.post(`/password-reset-requests/${id}/approve`, {
      newPassword,
      note,
    });
  } catch (error) {
    console.error("Error approving password reset request:", error);
    throw error;
  }
};

/**
 * Reject password reset request (Admin only)
 */
export const rejectPasswordResetRequest = async (
  id: number,
  note?: string,
): Promise<void> => {
  try {
    await apiClient.post(`/password-reset-requests/${id}/reject`, {
      note,
    });
  } catch (error) {
    console.error("Error rejecting password reset request:", error);
    throw error;
  }
};

/**
 * Delete password reset request (Admin only)
 */
export const deletePasswordResetRequest = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/password-reset-requests/${id}`);
  } catch (error) {
    console.error("Error deleting password reset request:", error);
    throw error;
  }
};

/**
 * Delete all password reset requests (Admin only)
 */
export const deleteAllPasswordResetRequests = async (
  status?: string,
): Promise<void> => {
  try {
    await apiClient.delete("/password-reset-requests", {});
  } catch (error) {
    console.error("Error deleting all password reset requests:", error);
    throw error;
  }
};

export default {
  submitPasswordResetRequest,
  getAllPasswordResetRequests,
  getPasswordResetRequestById,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
  deletePasswordResetRequest,
  deleteAllPasswordResetRequests,
};

