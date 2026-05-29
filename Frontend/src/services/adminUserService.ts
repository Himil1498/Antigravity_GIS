/**
 * Admin User Service
 * Service functions for admin-specific user operations
 * Including session stats, force logout, messaging, and activity tracking
 */

import axios from 'axios';

// Create axios instance for admin user APIs
const BACKEND_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:82/api';

const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header interceptor
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('opti_connect_token') || localStorage.getItem('opti_connect_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// Types
// ============================================================================

export interface SessionStats {
  activeSessions: number;
  totalActions: number;
  totalTimeToday: {
    raw: number;
    formatted: string;
  };
  currentSession: {
    ip_address: string;
    device_info: string;
    login_time: string;
    last_activity_time: string;
  } | null;
}

export interface RecentActivity {
  action: string;
  description: string;
  resourceType: string;
  resourceId: number | null;
  timestamp: string;
  ipAddress: string;
}

export interface AdminMessagePayload {
  userId: string | number;
  message: string;
  priority?: 'low' | 'medium' | 'high';
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

interface SessionStatsResponse extends ApiResponse<never> {
  stats: SessionStats;
}

interface ForceLogoutResponse extends ApiResponse<never> {
  message: string;
  sessionsTerminated: number;
}

interface AdminMessageResponse extends ApiResponse<never> {
  message: string;
}

interface RecentActivityResponse extends ApiResponse<never> {
  activities: RecentActivity[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get user session statistics
 * @param userId - User ID
 * @returns Session statistics
 */
export async function getUserSessionStats(userId: string | number): Promise<SessionStats> {
  try {
    const response = await apiClient.get<SessionStatsResponse>(`/users/${userId}/session-stats`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get session stats');
    }

    return response.data.stats;
  } catch (error: any) {
    console.error('Error getting user session stats:', error);
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      'Failed to get session statistics'
    );
  }
}

/**
 * Force logout all sessions for a user
 * @param userId - User ID
 * @returns Result with sessions terminated count
 */
export async function forceLogoutUser(userId: string | number): Promise<{
  message: string;
  sessionsTerminated: number;
}> {
  try {
    const response = await apiClient.post<ForceLogoutResponse>(`/users/${userId}/force-logout`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to force logout user');
    }

    return {
      message: response.data.message,
      sessionsTerminated: response.data.sessionsTerminated
    };
  } catch (error: any) {
    console.error('Error forcing logout:', error);
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      'Failed to force logout user'
    );
  }
}

/**
 * Send message from admin to user
 * @param payload - Message payload
 * @returns Success message
 */
export async function sendAdminMessage(payload: AdminMessagePayload): Promise<string> {
  try {
    const response = await apiClient.post<AdminMessageResponse>('/users/admin/send-message', payload);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to send message');
    }

    return response.data.message;
  } catch (error: any) {
    console.error('Error sending admin message:', error);
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      'Failed to send message'
    );
  }
}

/**
 * Get user's recent activity
 * @param userId - User ID
 * @param limit - Number of activities to fetch (default: 10)
 * @returns Array of recent activities
 */
export async function getUserRecentActivity(
  userId: string | number,
  limit: number = 10
): Promise<RecentActivity[]> {
  try {
    const response = await apiClient.get<RecentActivityResponse>(`/users/${userId}/recent-activity`, {
      params: { limit }
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get recent activity');
    }

    return response.data.activities;
  } catch (error: any) {
    console.error('Error getting user recent activity:', error);
    throw new Error(
      error.response?.data?.error ||
      error.message ||
      'Failed to get recent activity'
    );
  }
}

const adminUserService = {
  getUserSessionStats,
  forceLogoutUser,
  sendAdminMessage,
  getUserRecentActivity
};

export default adminUserService;

