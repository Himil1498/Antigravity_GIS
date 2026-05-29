/**
 * Admin Page Header Component
 * Displays the administration page header with icon and title
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';

const AdminPageHeader: React.FC = () => {
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[60%] pointer-events-none z-0 bg-gradient-to-b from-white/20 to-transparent dark:from-white/5" />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-[1]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-5 gap-4">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="flex-shrink-0 cursor-pointer"
              initial="idle"
              whileHover="hover"
            >
              <div className="h-10 w-10 rounded-lg bg-red-600 dark:bg-red-500 flex items-center justify-center" style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.12)' }}>
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </motion.svg>
              </div>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-red-600 dark:text-red-400">
                Administration
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                System administration and region management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border border-red-300 dark:border-red-700">
              <svg
                className="w-4 h-4 mr-1.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Administrator
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPageHeader;

