import React from "react";
import { motion, Variants } from "framer-motion";

interface GroupsHeaderProps {
  canCreate: boolean;
  onCreateGroup: () => void;
}

export const GroupsHeader: React.FC<GroupsHeaderProps> = ({
  canCreate,
  onCreateGroup,
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
              <div className="h-10 w-10 rounded-lg bg-amber-600 dark:bg-amber-500 flex items-center justify-center" style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.12)' }}>
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </motion.svg>
              </div>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-amber-600 dark:text-amber-400">
                User Groups
              </h1>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                Manage user groups and permissions
              </p>
            </div>
          </div>

          {canCreate && (
            <button
              onClick={onCreateGroup}
              className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

