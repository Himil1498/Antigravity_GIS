import React from 'react';

const AccessDenied: React.FC = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Only administrators can access this page.
      </p>
    </div>
  </div>
);

export default AccessDenied;

