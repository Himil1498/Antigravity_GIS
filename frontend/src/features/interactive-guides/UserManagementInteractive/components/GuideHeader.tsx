import React from 'react';

const GuideHeader: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="text-center">
        <div className="text-6xl mb-4">👥</div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          Users Management System
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Complete Guide for User Administration, CRUD Operations &
          Role-Based Access Control
        </p>
      </div>
    </div>
  );
};

export default GuideHeader;

