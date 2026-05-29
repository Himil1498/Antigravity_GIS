/**
 * Toolbox Header Component
 * Title bar with collapse and close buttons
 */

import React from 'react';

interface ToolboxHeaderProps {
  onCollapse: () => void;
  onClose?: () => void;
}

const ToolboxHeader: React.FC<ToolboxHeaderProps> = ({ onCollapse, onClose }) => {
  return (
    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 flex items-center">
        <span className="text-xl mr-2">📶</span>
        Sector RF Coverage
      </h3>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCollapse}
          className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-all"
          title="Collapse Toolbox"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500 rounded transition-all duration-300 group cursor-pointer"
            title="Close"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-90 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ToolboxHeader;

