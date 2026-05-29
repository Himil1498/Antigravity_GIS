import React from 'react';

const GuideHeader: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          Administration Panel Guide
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Complete User Flow for System Administration & Region Management
        </p>
        <div className="mt-4 inline-block bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-full">
          Admin Role Required
        </div>
      </div>
    </div>
  );
};

export default GuideHeader;

