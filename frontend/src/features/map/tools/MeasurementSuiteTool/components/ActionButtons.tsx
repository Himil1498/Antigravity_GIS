/**
 * Action Buttons Component
 * Save and Clear buttons for sector tool
 */

import React from 'react';

interface ActionButtonsProps {
  onClear: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onClear }) => {
  return (
    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
      <button
        onClick={onClear}
        className="flex-1 px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
      >
        Clear Sector
      </button>
    </div>
  );
};

export default ActionButtons;

