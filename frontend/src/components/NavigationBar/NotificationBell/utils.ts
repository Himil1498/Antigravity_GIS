/**
 * Notification Bell - Utility Functions
 */

import { NotificationType } from './types';

export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'password_reset_request':
    case 'security_alert':
      return 'text-red-600 dark:text-red-400';
    case 'region_request':
      return 'text-blue-600 dark:text-blue-400';
    case 'system_alert':
      return 'text-orange-600 dark:text-orange-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

export const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'password_reset_request':
      return '🔐';
    case 'user_verification':
      return '✉️';
    case 'system_alert':
      return '⚠️';
    case 'region_request':
      return '🗺️';
    case 'security_alert':
      return '🚨';
    default:
      return '📢';
  }
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export const getNavigationPath = (type: string): string | null => {
  switch (type) {
    case 'password_reset_request':
      return '/admin/password-reset-requests';
    case 'region_request':
      return '/admin/region-requests';
    default:
      return null;
  }
};

