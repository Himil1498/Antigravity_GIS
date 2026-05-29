/**
 * Notification Dropdown Footer Component
 * Displays "View All Notifications" button
 */

import React from 'react';

interface NotificationDropdownFooterProps {
  onViewAll: () => void;
}

export const NotificationDropdownFooter: React.FC<NotificationDropdownFooterProps> = ({
  onViewAll
}) => {
  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
      <button
        onClick={onViewAll}
        className="w-full text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
      >
        View All Notifications
      </button>
    </div>
  );
};

