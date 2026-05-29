import React from 'react';
import { LoadingCardProps, LoadingTableProps, ProgressBarProps, InlineLoaderProps } from './types';
import { Skeleton, LoadingDots } from './LoadingComponents';

export const LoadingCard: React.FC<LoadingCardProps> = ({ count = 1, className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton variant="circular" width="48px" height="48px" />
              <div className="flex-1 space-y-2">
                <Skeleton width="60%" height="16px" />
                <Skeleton width="40%" height="12px" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton width="100%" height="12px" />
              <Skeleton width="80%" height="12px" />
              <Skeleton width="90%" height="12px" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export const LoadingTable: React.FC<LoadingTableProps> = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3"><Skeleton width="80%" height="12px" /></th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4"><Skeleton width="70%" height="12px" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showPercentage = true,
  color = 'blue',
  size = 'md',
  className = '',
}) => {
  const colorClasses = { blue: 'bg-blue-600', green: 'bg-green-600', yellow: 'bg-yellow-600', red: 'bg-red-600' };
  const sizeClasses = { sm: 'h-1', md: 'h-2', lg: 'h-3' };
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        {showPercentage && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{Math.round(clampedProgress)}%</span>}
      </div>
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`} style={{ width: `${clampedProgress}%` }} />
      </div>
    </div>
  );
};

export const InlineLoader: React.FC<InlineLoaderProps> = ({ text = 'Loading', size = 'md', className = '' }) => {
  const sizeClasses = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  return (
    <div className={`flex items-center space-x-2 text-gray-600 dark:text-gray-400 ${className}`}>
      <LoadingDots size={size === 'sm' ? 'sm' : 'md'} color="gray" />
      <span className={`${sizeClasses[size]} font-medium`}>{text}</span>
    </div>
  );
};

