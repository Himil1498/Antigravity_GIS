/**
 * Notification Service
 * Handles all notification-related API calls
 */

import axios from "axios";

const BACKEND_API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:82/api";

const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 60000,
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

// Notification type
export interface Notification {
  id: number;
  user_id: number;
  type:
    | "password_reset_request"
    | "user_verification"
    | "system_alert"
    | "region_request"
    | "user_activity"
    | "security_alert";
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

/**
 * Get all notifications for the current user
 */
export const getMyNotifications = async (
  unreadOnly = false,
): Promise<Notification[]> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      notifications: Notification[];
    }>("/notifications", {
      params: { unreadOnly: unreadOnly.toString() },
    });
    return response.data.notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await apiClient.get<{ success: boolean; count: number }>(
      "/notifications/unread-count",
    );
    return response.data.count;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (id: number): Promise<void> => {
  try {
    await apiClient.patch(`/notifications/${id}/read`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await apiClient.patch("/notifications/read-all");
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/notifications/${id}`);
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Clear all read notifications
 */
export const clearAllReadNotifications = async (): Promise<void> => {
  try {
    await apiClient.delete("/notifications/clear-all");
  } catch (error) {
    console.error("Error clearing notifications:", error);
    throw error;
  }
};

export default {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllReadNotifications,
};

