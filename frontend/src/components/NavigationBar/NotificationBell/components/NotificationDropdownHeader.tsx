/**
 * Notification Dropdown Header Component
 * Displays the header with unread count and "Mark all as read" button
 */

import React from 'react';

interface NotificationDropdownHeaderProps {
  unreadCount: number;
  isLoading: boolean;
  onMarkAllAsRead: () => void;
}

export const NotificationDropdownHeader: React.FC<NotificationDropdownHeaderProps> = ({
  unreadCount,
  isLoading,
  onMarkAllAsRead
}) => {
  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-t-xl">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Notifications
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {unreadCount} unread
        </p>
      </div>
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllAsRead}
          disabled={isLoading}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50"
        >
          Mark all read
        </button>
      )}
    </div>
  );
};

