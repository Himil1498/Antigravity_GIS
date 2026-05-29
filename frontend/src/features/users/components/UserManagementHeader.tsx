import React from "react";
import { motion, Variants } from "framer-motion";

interface UserManagementHeaderProps {
  onCreateUser: () => void;
  canCreate: boolean;
  onExport: () => void;
  onImport: () => void;
  onRefresh: () => void;
  canExport: boolean;
  canImport: boolean;
  isRefreshing?: boolean;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  onCreateUser,
  canCreate,
  onExport,
  onImport,
  onRefresh,
  canExport,
  canImport,
  isRefreshing = false,
}) => {
  // Define icon variants for hover consistency
  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: { 
      scale: 1.15, 
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 }
    }
  };
  return (
    <div 
      className="bg-white dark:bg-gray-800 border-b border-gray-200/60 dark:border-gray-700/60 relative overflow-hidden"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[60%] pointer-events-none z-0 bg-gradient-to-b from-white/60 to-transparent dark:from-white/5" />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-[1]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-5 gap-4">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="flex-shrink-0 cursor-pointer"
              initial="idle"
              whileHover="hover"
            >
              <div className="h-10 w-10 rounded-lg bg-pink-600 dark:bg-pink-500 flex items-center justify-center" style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.12)' }}>
                <motion.svg
                  variants={iconVariants}
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </motion.svg>
              </div>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-pink-600 dark:text-pink-400">
                User Management
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Manage system users with role-based access control
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200 ${isRefreshing ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <svg
                className={`h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            {canExport && (
              <button
                onClick={onExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5 mr-2 text-green-600 dark:text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export
              </button>
            )}
            {canImport && (
              <button
                onClick={onImport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Import
              </button>
            )}
            {canCreate && (
              <button
                onClick={onCreateUser}
                className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add New User
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementHeader;

