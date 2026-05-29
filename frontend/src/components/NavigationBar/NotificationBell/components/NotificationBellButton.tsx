/**
 * Notification Bell Button Component
 * Displays the bell icon with unread count badge
 */

import React from "react";
import { motion, Variants } from "framer-motion";

interface NotificationBellButtonProps {
  unreadCount: number;
  onClick: () => void;
}

export const NotificationBellButton: React.FC<NotificationBellButtonProps> = ({
  unreadCount,
  onClick,
}) => {
  // Define icon variants for consistency
  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: { 
      scale: 1.25, 
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.button
      onClick={onClick}
      initial="idle"
      whileHover="hover"
      className="relative px-2.5 py-2 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-full transition-all duration-200 group flex items-center"
      aria-label="Notifications"
    >
      <motion.svg
        variants={iconVariants}
        className="w-6 h-6 text-rose-600 dark:text-rose-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </motion.svg>

      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </motion.button>
  );
};

