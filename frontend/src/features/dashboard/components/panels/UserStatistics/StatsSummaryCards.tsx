import React from "react";
import { StatsSummaryCardsProps } from '../../../types/userStats.types';

const StatsSummaryCards: React.FC<StatsSummaryCardsProps> = ({ statistics }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {statistics.total}
        </p>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          {statistics.active}
        </p>
      </div>
      
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
          {statistics.inactive}
        </p>
      </div>
      
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          New This Week
        </p>
        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {statistics.newThisWeek}
        </p>
      </div>
    </div>
  );
};

export default StatsSummaryCards;
