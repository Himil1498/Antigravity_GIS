/**
 * Notification Item Component
 * Displays a single notification in the dropdown list
 */

import React from 'react';
import { Notification } from '../types';
import { getTypeColor, getTypeIcon, formatTimeAgo } from '../utils';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onDelete
}) => {
  return (
    <div
      onClick={() => onClick(notification)}
      className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors duration-150 ${
        !notification.is_read
          ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 text-2xl">
          {getTypeIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-semibold ${getTypeColor(notification.type)}`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center mt-1 space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(notification.created_at)}
                </span>
                {!notification.is_read && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </div>
            </div>

            <button
              onClick={(e) => onDelete(notification.id, e)}
              className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Delete notification"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

