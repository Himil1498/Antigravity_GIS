/**
 * Reason Input Component
 * Location: Frontend/src/features/users/region-requests/RegionRequestForm/components/ReasonInput.tsx
 */

import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface ReasonInputProps {
  reason: string;
  onReasonChange: (reason: string) => void;
}

const ReasonInput: React.FC<ReasonInputProps> = ({ reason, onReasonChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Reason for Request *
      </label>
      <div className="relative">
        <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          rows={5}
          placeholder="Please provide a detailed reason for your request..."
          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          required
        />
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Provide specific details about why you need this access or what changes you want to make.
      </p>
    </div>
  );
};

export default ReasonInput;

