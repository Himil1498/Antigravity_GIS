import React from 'react';

const StatsOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <div className="text-3xl font-bold text-red-600">6</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Admin Tabs
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <div className="text-3xl font-bold text-rose-600">Admin</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Only Access
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <div className="text-3xl font-bold text-orange-600">System</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Wide Control
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <div className="text-3xl font-bold text-purple-600">Region</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Management
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;

