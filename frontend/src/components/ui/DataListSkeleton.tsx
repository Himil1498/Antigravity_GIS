import React from 'react';

const DataListSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Mimic multiple sections or a long list */}
      {[1, 2, 3].map((sectionIndex) => (
        <div 
          key={sectionIndex} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          {/* Section Header Skeleton */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
          </div>

          {/* List Items Skeleton */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[1, 2, 3].map((itemIndex) => (
              <div key={itemIndex} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Title / Name */}
                    <div className="flex items-center space-x-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                      <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded-full w-16"></div>
                    </div>
                    {/* Details Row */}
                    <div className="flex items-center flex-wrap gap-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="ml-4 flex items-center space-x-3">
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DataListSkeleton;

