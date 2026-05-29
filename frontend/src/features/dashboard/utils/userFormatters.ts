/**
 * Get user initials from full name
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format minutes into human-readable time ago format
 */
export const formatTimeOnline = (minutes: number): string => {
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/**
 * Get day of week abbreviation for chart
 */
export const getDayAbbreviation = (index: number): string => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[(new Date().getDay() - 6 + index) % 7];
};

