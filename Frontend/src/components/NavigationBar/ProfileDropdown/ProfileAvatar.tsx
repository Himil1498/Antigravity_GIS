import React from "react";
import { getUserInitials } from "./sessionUtils";
import { UserProfile } from "./types";

interface ProfileAvatarProps {
  user: UserProfile | null;
  isOpen: boolean;
  temporaryAccessCount: number;
  onToggle: () => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  user,
  isOpen,
  temporaryAccessCount,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center space-x-3 transition-all duration-200 group premium-header-capsule ${
        isOpen ? "bg-gray-50 dark:bg-gray-800" : ""
      }`}
    >
      <div className="flex-shrink-0 relative">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5 transform group-hover:scale-110 transition-transform duration-200">
            <div className="h-full w-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
              <span className="text-sm font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {getUserInitials(user?.name)}
              </span>
            </div>
          </div>
          {temporaryAccessCount > 0 ? (
            <div
              className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-amber-500 border-2 border-white dark:border-gray-800 ring-2 ring-amber-500/30 flex items-center justify-center"
              title={`${temporaryAccessCount} temporary access grants`}
            >
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          ) : (
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800 ring-2 ring-green-500/30 animate-pulse"></div>
          )}
        </div>
      </div>
      <div className="hidden md:block text-left">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          {user?.name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
        </div>
      </div>
      <svg
        className={`hidden md:block w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
};

export default ProfileAvatar;

