/**
 * Request Type Selector Component
 * Location: Frontend/src/features/users/region-requests/RegionRequestForm/components/RequestTypeSelector.tsx
 */

import React from 'react';
import { REQUEST_TYPE_OPTIONS } from '../constants';
import type { RequestType } from '../types';

interface RequestTypeSelectorProps {
  requestType: RequestType;
  onRequestTypeChange: (type: RequestType) => void;
}

const RequestTypeSelector: React.FC<RequestTypeSelectorProps> = ({
  requestType,
  onRequestTypeChange
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Request Type *
      </label>
      <div className="grid grid-cols-3 gap-3">
        {REQUEST_TYPE_OPTIONS.map(({ type, label, description }) => (
          <button
            key={type}
            type="button"
            onClick={() => onRequestTypeChange(type)}
            className={`p-3 rounded-lg border-2 transition-all ${
              requestType === type
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            <div className="text-sm font-semibold">{label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RequestTypeSelector;

