import React from 'react';
import type { ApiGroup } from '../../../../services/group/index';

interface DialogHeaderProps {
  group: ApiGroup;
  onClose: () => void;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ group, onClose }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {group.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {group.description || 'No description'}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-gray-400 hover:text-gray-500"
        aria-label="Close"
        title="Close"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

