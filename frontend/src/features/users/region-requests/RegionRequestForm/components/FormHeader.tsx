/**
 * Form Header Component
 * Location: Frontend/src/features/users/region-requests/RegionRequestForm/components/FormHeader.tsx
 */

import React from 'react';
import { MapIcon } from '@heroicons/react/24/outline';

const FormHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl shadow-xl border-2 border-blue-100 dark:border-blue-900/30 p-6 mb-6">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
          <MapIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
            Request Region Access
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
            Submit a request to access, modify, or create a new region
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormHeader;

