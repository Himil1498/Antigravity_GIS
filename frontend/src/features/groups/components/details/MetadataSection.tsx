import React from 'react';

interface MetadataSectionProps {
  createdAt: string;
  updatedAt: string;
}

export const MetadataSection: React.FC<MetadataSectionProps> = ({
  createdAt,
  updatedAt,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Created
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Last Updated
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(updatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

