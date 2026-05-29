import React from 'react';

const GuideHeader: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="text-center">
        <div className="text-6xl mb-4">📊</div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          System-Wide Performance Monitoring & Usage Analytics
        </p>
        <div className="mt-4 inline-block bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
          ALL Users' Data • System-Wide Metrics
        </div>
      </div>
    </div>
  );
};

export default GuideHeader;

