export const getNotificationTypeColor = (type: string): string => {
  switch (type) {
    case 'password_reset_request': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
    case 'security_alert': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
    case 'region_request': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
    case 'system_alert': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
    default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800';
  }
};

export const getNotificationTypeIcon = (type: string): string => {
  switch (type) {
    case 'password_reset_request': return '🔐';
    case 'user_verification': return '✉️';
    case 'system_alert': return '⚠️';
    case 'region_request': return '🗺️';
    case 'security_alert': return '🚨';
    case 'user_activity': return '👤';
    default: return '📢';
  }
};

export const formatNotificationDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

