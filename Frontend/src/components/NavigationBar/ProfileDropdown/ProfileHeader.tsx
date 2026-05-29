import React from "react";
import { getUserInitials } from "./sessionUtils";
import { UserProfile } from "./types";

/**
 * Get dynamic role badge colors based on role name.
 * System roles get predefined premium colors; custom roles get auto-generated gradients.
 */
const getRoleBadgeStyle = (role?: string): string => {
  const r = (role || "user").toLowerCase();
  const systemRoleColors: Record<string, string> = {
    admin: "from-red-500 to-rose-600",
    superadmin: "from-yellow-500 to-amber-600",
    manager: "from-blue-500 to-indigo-600",
    technician: "from-teal-500 to-cyan-600",
    developer: "from-purple-500 to-violet-600",
    user: "from-gray-500 to-slate-600",
  };
  if (systemRoleColors[r]) return systemRoleColors[r];

  // Auto-generate a unique gradient for custom roles based on the role name hash
  const gradients = [
    "from-emerald-500 to-green-600",
    "from-pink-500 to-fuchsia-600",
    "from-orange-500 to-amber-600",
    "from-sky-500 to-blue-600",
    "from-lime-500 to-emerald-600",
    "from-violet-500 to-purple-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < r.length; i++) hash = r.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
};

interface ProfileHeaderProps {
  user: UserProfile | null;
  temporaryAccessCount: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, temporaryAccessCount }) => {
  const roleGradient = getRoleBadgeStyle(user?.role);
  const displayRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "User";

  return (
    <div className="px-6 py-5 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-800">
            <span className="text-lg font-bold text-white">
              {getUserInitials(user?.name)}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {user?.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
            {user?.email}
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${roleGradient} text-white shadow-md`}>
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {displayRole}
            </span>

            {temporaryAccessCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md animate-pulse">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Temp Access ({temporaryAccessCount})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

