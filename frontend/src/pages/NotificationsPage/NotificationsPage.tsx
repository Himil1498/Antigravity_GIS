import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllReadNotifications,
  type Notification,
} from "../../services/notification/index";
import {
  getNotificationTypeColor,
  getNotificationTypeIcon,
  formatNotificationDate,
} from "./NotificationsPageUtils";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<"all" | "unread" | "read">(
    "all",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      // Always fetch all notifications for client-side filtering
      const notifs = await getMyNotifications(false);
      setNotifications(notifs);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter notifications based on selected tab
  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "unread") return !n.is_read;
    if (filterType === "read") return n.is_read;
    return true; // 'all'
  });

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Only mark as read if not already read - no navigation
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n,
          ),
        );
      }
      // No navigation - just mark as read
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsProcessing(true);
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setIsProcessing(true);
      await clearAllReadNotifications();
      await fetchNotifications();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const readCount = notifications.filter((n) => n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "You are all caught up!"}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Filter Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filterType === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType("unread")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filterType === "unread"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterType("read")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filterType === "read"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Read ({readCount})
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 transition-colors"
              >
                Mark all as read
              </button>
            )}
            {readCount > 0 && (
              <button
                onClick={handleClearAll}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
              >
                Clear all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No notifications
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filterType === "unread"
                    ? "You don't have any unread notifications"
                    : filterType === "read"
                      ? "You don't have any read notifications"
                      : "You're all caught up!"}
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`border-l-4 rounded-lg shadow-sm transition-all duration-200 cursor-pointer ${getNotificationTypeColor(notification.type)} ${
                  !notification.is_read
                    ? "border-opacity-100"
                    : "border-opacity-50 opacity-75"
                } hover:shadow-md hover:scale-[1.01]`}
              >
                <div className="bg-white dark:bg-gray-800 rounded-r-lg p-6">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-3xl">
                      {getNotificationTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                            {!notification.is_read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {formatNotificationDate(notification.created_at)}
                            </span>
                            <span className="uppercase font-semibold text-gray-400">
                              {notification.type.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) =>
                            handleDeleteNotification(notification.id, e)
                          }
                          className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Delete notification"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

