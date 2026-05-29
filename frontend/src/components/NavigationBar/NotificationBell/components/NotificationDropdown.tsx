/**
 * Notification Dropdown Component
 * Manages the dropdown panel with list of notifications
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Notification } from "../types";
import { NotificationDropdownHeader } from "./NotificationDropdownHeader";
import { NotificationEmptyState } from "./NotificationEmptyState";
import { NotificationItem } from "./NotificationItem";
import { NotificationDropdownFooter } from "./NotificationDropdownFooter";

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  isLoading,
  onMarkAllAsRead,
  onMarkAsRead,
  onDelete,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    if (!notification.is_read) {
      await onMarkAsRead(notification.id);
    }

    // Special handling for system updates: open the side panel
    if (notification.type === 'system_update') {
      window.dispatchEvent(new CustomEvent('openUpdatesPanel'));
      onClose();
      return;
    }

    // Use action_url from notification if available
    if (notification.action_url) {
      navigate(notification.action_url);
      onClose();
    }
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleViewAll = () => {
    navigate("/notifications");
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] flex flex-col">
      <NotificationDropdownHeader
        unreadCount={unreadCount}
        isLoading={isLoading}
        onMarkAllAsRead={onMarkAllAsRead}
      />

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <NotificationEmptyState />
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <NotificationDropdownFooter onViewAll={handleViewAll} />
      )}
    </div>
  );
};

