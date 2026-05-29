export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-orange-500'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const getRoleBadgeColor = (role: string): string => {
  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    engineer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  };
  return roleColors[role.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

export const formatTimeAgo = (timestamp: string | null | undefined): string => {
  if (!timestamp) return 'Unknown';
  
  const time = new Date(timestamp);
  if (isNaN(time.getTime())) return 'Unknown';

  const now = new Date();
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export const parseDeviceInfo = (deviceInfo: string | null | undefined): { browser: string; os: string } => {
  // Handle null, undefined, or empty device info
  if (!deviceInfo || typeof deviceInfo !== 'string') {
    return {
      browser: 'Unknown',
      os: 'Unknown'
    };
  }

  const browserMatch = deviceInfo.match(/(Chrome|Firefox|Safari|Edge|Opera)/i);
  const osMatch = deviceInfo.match(/(Windows|Mac|Linux|Android|iOS)/i);
  return {
    browser: browserMatch ? browserMatch[1] : 'Unknown',
    os: osMatch ? osMatch[1] : 'Unknown'
  };
};

