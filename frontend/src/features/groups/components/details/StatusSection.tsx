import React from 'react';

interface StatusSectionProps {
  isActive: boolean;
}

export const StatusSection: React.FC<StatusSectionProps> = ({ isActive }) => {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        Status
      </h4>
      <span
        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
};

