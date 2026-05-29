import type { User } from "../../../types/auth/index";

/**
 * Helper function to safely get user display name
 */
export const getUserDisplayName = (profileData: User | null): string => {
  return profileData?.name || profileData?.username || "User";
};

/**
 * Helper function to safely get role display
 */
export const getRoleDisplay = (profileData: User | null): string => {
  return profileData?.role || "User";
};

/**
 * Helper function to safely get status
 */
export const getStatusDisplay = (profileData: User | null): string => {
  // First check the isActive boolean field (primary source)
  if (profileData?.isActive !== undefined) {
    return profileData.isActive ? "Active" : "Inactive";
  }
  // Fallback to status string field
  if (profileData?.status) return profileData.status;
  return "Unknown";
};

/**
 * Helper function to safely format dates
 */
export const formatDate = (
  date: string | number | Date | undefined | null,
  format: "date" | "datetime" = "date"
): string => {
  if (!date) return "N/A";
  try {
    const dateObj = new Date(date);
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return "N/A";

    if (format === "datetime") {
      return dateObj.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return "N/A";
  }
};

/**
 * Helper function to format date in short format (Month Year)
 */
export const formatDateShort = (
  date: string | number | Date | undefined | null
): string => {
  if (!date) return "N/A";
  try {
    const dateObj = new Date(date);
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return "N/A";

    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric"
    });
  } catch {
    return "N/A";
  }
};

