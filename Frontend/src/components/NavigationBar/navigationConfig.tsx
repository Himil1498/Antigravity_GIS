import React from "react";

export interface NavItem {
  name: string;
  href: string;
  color: string;
  iconColor: string;
  activeHex: string; // New: Stable hex color for active state morphing
  bgColor: string;
  icon: React.ReactNode;
  roles: string[];
  requiredPermission?: string;
}

// Alias for backwards compatibility
export type NavigationItem = NavItem;

export const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    color: "from-blue-500 to-blue-600",
    iconColor: "text-blue-600 dark:text-blue-400",
    activeHex: "#3b82f6",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    roles: ["admin", "manager", "technician", "user"],
    requiredPermission: "dashboard:view",
  },
  {
    name: "Map",
    href: "/map",
    color: "from-sky-500 to-sky-600",
    iconColor: "text-sky-600 dark:text-sky-400",
    activeHex: "#0ea5e9",
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
    roles: ["admin", "manager", "technician", "user"],
    requiredPermission: "map:view",
  },
  {
    name: "Network Planning",
    href: "/network-planning",
    color: "from-purple-500 to-purple-600",
    iconColor: "text-purple-600 dark:text-purple-400",
    activeHex: "#9333ea", // purple-600
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    roles: ["admin", "manager", "technician", "user"],
    requiredPermission: "network:view",
  },
  {
    name: "Dark Fiber",
    href: "/dark-fiber",
    color: "from-teal-500 to-teal-600",
    iconColor: "text-teal-600 dark:text-teal-400",
    activeHex: "#14b8a6",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    roles: ["admin", "manager", "technician", "user"],
    requiredPermission: "darkfiber:view",
  },
  {
    name: "Analytics",
    href: "/analytics",
    color: "from-cyan-500 to-cyan-600",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    activeHex: "#06b6d4",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    roles: ["admin", "manager"],
    requiredPermission: "analytics:view",
  },
  {
    name: "Tools",
    href: "/tools",
    color: "from-orange-500 to-orange-600",
    iconColor: "text-orange-600 dark:text-orange-400",
    activeHex: "#f97316",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    roles: ["admin", "manager", "user"],
    requiredPermission: "converter:view",
  },
  {
    name: "Users",
    href: "/users",
    color: "from-pink-500 to-pink-600",
    iconColor: "text-pink-600 dark:text-pink-400",
    activeHex: "#ec4899",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    roles: ["admin", "manager", "technician", "user"],
    requiredPermission: "users:view",
  },
  {
    name: "Groups",
    href: "/groups",
    color: "from-amber-500 to-amber-600",
    iconColor: "text-amber-600 dark:text-amber-400",
    activeHex: "#f59e0b",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    roles: ["admin", "manager"],
    requiredPermission: "groups:view",
  },
  {
    name: "Admin",
    href: "/admin",
    color: "from-rose-500 to-rose-600",
    iconColor: "text-rose-600 dark:text-rose-400",
    activeHex: "#f43f5e",
    bgColor: "bg-rose-50 dark:bg-rose-900/20",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    roles: ["admin", "manager", "technician", "user"],
    requiredPermission: "admin:view",
  },
];

export const filterNavigationByRole = (
  items: NavItem[],
  userRole?: string,
): NavItem[] => {
  if (!userRole) return [];
  return items.filter((item) => item.roles.includes(userRole));
};

// Helper function to get all navigation items
export const getAllNavigationItems = (): NavItem[] => {
  return navigationItems;
};
