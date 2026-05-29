import { PermissionCategory } from "../../../../types/permissions/index";
import { CategoryStyles } from "./types";

export const getCategoryIcon = (category: PermissionCategory): string => {
  const icons: Record<PermissionCategory, string> = {
    [PermissionCategory.GIS_TOOLS]:
      "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    [PermissionCategory.DATA_MANAGEMENT]:
      "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
    [PermissionCategory.USER_MANAGEMENT]:
      "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    [PermissionCategory.GROUP_MANAGEMENT]:
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    [PermissionCategory.SETTINGS]:
      "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    [PermissionCategory.SEARCH]: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    [PermissionCategory.ADMIN]:
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  };
  return icons[category];
};

export const getCategoryStyles = (
  category: PermissionCategory,
): CategoryStyles => {
  const styles: Record<PermissionCategory, CategoryStyles> = {
    [PermissionCategory.GIS_TOOLS]: {
      icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
      bgLight: "bg-orange-50",
      bgDark: "dark:bg-orange-900/20",
      borderLight: "border-orange-500",
      borderDark: "dark:border-orange-500",
      textLight: "text-orange-600",
      textDark: "dark:text-orange-400",
      hoverLight: "hover:bg-orange-100",
      hoverDark: "dark:hover:bg-orange-900/30",
      selectedBg: "bg-orange-100 dark:bg-orange-900/30",
      selectedBorder: "border-orange-300 dark:border-orange-700",
      checkboxColor: "text-orange-600 focus:ring-orange-500",
      buttonBg: "bg-orange-100 dark:bg-orange-900/40",
      buttonHover: "hover:bg-orange-200 dark:hover:bg-orange-900/60",
      buttonSelectedBg: "bg-orange-600",
      buttonSelectedHover: "hover:bg-orange-700",
    },
    [PermissionCategory.DATA_MANAGEMENT]: {
      icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
      bgLight: "bg-green-50",
      bgDark: "dark:bg-green-900/20",
      borderLight: "border-green-500",
      borderDark: "dark:border-green-500",
      textLight: "text-green-600",
      textDark: "dark:text-green-400",
      hoverLight: "hover:bg-green-100",
      hoverDark: "dark:hover:bg-green-900/30",
      selectedBg: "bg-green-100 dark:bg-green-900/30",
      selectedBorder: "border-green-300 dark:border-green-700",
      checkboxColor: "text-green-600 focus:ring-green-500",
      buttonBg: "bg-green-100 dark:bg-green-900/40",
      buttonHover: "hover:bg-green-200 dark:hover:bg-green-900/60",
      buttonSelectedBg: "bg-green-600",
      buttonSelectedHover: "hover:bg-green-700",
    },
    [PermissionCategory.USER_MANAGEMENT]: {
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-900/20",
      borderLight: "border-blue-500",
      borderDark: "dark:border-blue-500",
      textLight: "text-blue-600",
      textDark: "dark:text-blue-400",
      hoverLight: "hover:bg-blue-100",
      hoverDark: "dark:hover:bg-blue-900/30",
      selectedBg: "bg-blue-100 dark:bg-blue-900/30",
      selectedBorder: "border-blue-300 dark:border-blue-700",
      checkboxColor: "text-blue-600 focus:ring-blue-500",
      buttonBg: "bg-blue-100 dark:bg-blue-900/40",
      buttonHover: "hover:bg-blue-200 dark:hover:bg-blue-900/60",
      buttonSelectedBg: "bg-blue-600",
      buttonSelectedHover: "hover:bg-blue-700",
    },
    [PermissionCategory.GROUP_MANAGEMENT]: {
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      bgLight: "bg-indigo-50",
      bgDark: "dark:bg-indigo-900/20",
      borderLight: "border-indigo-500",
      borderDark: "dark:border-indigo-500",
      textLight: "text-indigo-600",
      textDark: "dark:text-indigo-400",
      hoverLight: "hover:bg-indigo-100",
      hoverDark: "dark:hover:bg-indigo-900/30",
      selectedBg: "bg-indigo-100 dark:bg-indigo-900/30",
      selectedBorder: "border-indigo-300 dark:border-indigo-700",
      checkboxColor: "text-indigo-600 focus:ring-indigo-500",
      buttonBg: "bg-indigo-100 dark:bg-indigo-900/40",
      buttonHover: "hover:bg-indigo-200 dark:hover:bg-indigo-900/60",
      buttonSelectedBg: "bg-indigo-600",
      buttonSelectedHover: "hover:bg-indigo-700",
    },
    [PermissionCategory.SETTINGS]: {
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      bgLight: "bg-purple-50",
      bgDark: "dark:bg-purple-900/20",
      borderLight: "border-purple-500",
      borderDark: "dark:border-purple-500",
      textLight: "text-purple-600",
      textDark: "dark:text-purple-400",
      hoverLight: "hover:bg-purple-100",
      hoverDark: "dark:hover:bg-purple-900/30",
      selectedBg: "bg-purple-100 dark:bg-purple-900/30",
      selectedBorder: "border-purple-300 dark:border-purple-700",
      checkboxColor: "text-purple-600 focus:ring-purple-500",
      buttonBg: "bg-purple-100 dark:bg-purple-900/40",
      buttonHover: "hover:bg-purple-200 dark:hover:bg-purple-900/60",
      buttonSelectedBg: "bg-purple-600",
      buttonSelectedHover: "hover:bg-purple-700",
    },
    [PermissionCategory.SEARCH]: {
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
      bgLight: "bg-pink-50",
      bgDark: "dark:bg-pink-900/20",
      borderLight: "border-pink-500",
      borderDark: "dark:border-pink-500",
      textLight: "text-pink-600",
      textDark: "dark:text-pink-400",
      hoverLight: "hover:bg-pink-100",
      hoverDark: "dark:hover:bg-pink-900/30",
      selectedBg: "bg-pink-100 dark:bg-pink-900/30",
      selectedBorder: "border-pink-300 dark:border-pink-700",
      checkboxColor: "text-pink-600 focus:ring-pink-500",
      buttonBg: "bg-pink-100 dark:bg-pink-900/40",
      buttonHover: "hover:bg-pink-200 dark:hover:bg-pink-900/60",
      buttonSelectedBg: "bg-pink-600",
      buttonSelectedHover: "hover:bg-pink-700",
    },
    [PermissionCategory.ADMIN]: {
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      bgLight: "bg-red-50",
      bgDark: "dark:bg-red-900/20",
      borderLight: "border-red-500",
      borderDark: "dark:border-red-500",
      textLight: "text-red-600",
      textDark: "dark:text-red-400",
      hoverLight: "hover:bg-red-100",
      hoverDark: "dark:hover:bg-red-900/30",
      selectedBg: "bg-red-100 dark:bg-red-900/30",
      selectedBorder: "border-red-300 dark:border-red-700",
      checkboxColor: "text-red-600 focus:ring-red-500",
      buttonBg: "bg-red-100 dark:bg-red-900/40",
      buttonHover: "hover:bg-red-200 dark:hover:bg-red-900/60",
      buttonSelectedBg: "bg-red-600",
      buttonSelectedHover: "hover:bg-red-700",
    },
  }; // End of styles object

  // return styles[category];
  // Fallback for unknown categories
  return (
    styles[category] || {
      icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", // Information Circle
      bgLight: "bg-gray-50",
      bgDark: "dark:bg-gray-800",
      borderLight: "border-gray-200",
      borderDark: "dark:border-gray-700",
      textLight: "text-gray-600",
      textDark: "dark:text-gray-400",
      hoverLight: "hover:bg-gray-100",
      hoverDark: "dark:hover:bg-gray-700",
      selectedBg: "bg-gray-100 dark:bg-gray-800",
      selectedBorder: "border-gray-300 dark:border-gray-600",
      checkboxColor: "text-gray-600 focus:ring-gray-500",
      buttonBg: "bg-gray-100 dark:bg-gray-700",
      buttonHover: "hover:bg-gray-200 dark:hover:bg-gray-600",
      buttonSelectedBg: "bg-gray-600",
      buttonSelectedHover: "hover:bg-gray-700",
    }
  );
};

