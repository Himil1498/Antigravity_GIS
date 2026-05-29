import React from "react";
import { Link } from "react-router-dom";
import { UserProfile } from "./types";

interface MenuItemsProps {
  user: UserProfile | null;
  onClose: () => void;
  onProfileNavigation: (e: React.MouseEvent) => void;
}

const MenuItems: React.FC<MenuItemsProps> = ({
  user,
  onClose,
  onProfileNavigation,
}) => {
  return (
    <div className="py-2">
      <button
        onClick={onProfileNavigation}
        className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
      >
        <svg
          className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span className="font-medium">View Profile</span>
      </button>

      <Link
        to="/security"
        onClick={onClose}
        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
      >
        <svg
          className="w-5 h-5 mr-3 text-violet-600 dark:text-violet-400 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span className="font-medium">Security & 2FA</span>
      </Link>

      <Link
        to="/request-region"
        onClick={onClose}
        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
      >
        <svg
          className="w-5 h-5 mr-3 text-emerald-600 dark:text-emerald-400 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <span className="font-medium">Request Region Access</span>
      </Link>

      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-700 my-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Company
            </p>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1 truncate">
              {user?.company || "N/A"}
            </p>
          </div>
          <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Regions
            </p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
              {user?.assignedRegions?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItems;

