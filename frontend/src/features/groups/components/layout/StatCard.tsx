// ============================================================================
// 2. StatCard.tsx - Reusable stat card component
// ============================================================================
import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  colorClass,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate mb-2">
              {title}
            </dt>
            <dd className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </dd>
          </div>
          <div className="flex-shrink-0">
            <div
              className={`h-12 w-12 rounded-lg ${colorClass} flex items-center justify-center`}
            >
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

