/**
 * Notification Bell Component (Main)
 * Orchestrates notification bell button and dropdown panel
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from './useNotifications';
import { NotificationBellButton } from './components/NotificationBellButton';
import { NotificationDropdown } from './components/NotificationDropdown';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotif
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <NotificationBellButton
        unreadCount={unreadCount}
        onClick={handleToggleDropdown}
      />

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
          onMarkAllAsRead={markAllAsRead}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotif}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default NotificationBell;

