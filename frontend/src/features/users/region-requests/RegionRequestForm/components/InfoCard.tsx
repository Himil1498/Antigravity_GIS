/**
 * Info Card Component
 * Location: Frontend/src/features/users/region-requests/RegionRequestForm/components/InfoCard.tsx
 */

import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { REQUEST_TYPE_INFO } from '../constants';

const InfoCard: React.FC = () => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <ExclamationCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
            Request Types
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
            <li><strong>Access:</strong> {REQUEST_TYPE_INFO.access}</li>
            <li><strong>Modification:</strong> {REQUEST_TYPE_INFO.modification}</li>
            <li><strong>Creation:</strong> {REQUEST_TYPE_INFO.creation}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;

