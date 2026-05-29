import React from 'react';
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { TemporaryRegionAccess } from '../types/types';

interface ExpiringSoonWarningProps {
  expiringGrants: TemporaryRegionAccess[];
}

const ExpiringSoonWarning: React.FC<ExpiringSoonWarningProps> = ({ expiringGrants }) => {
  if (expiringGrants.length === 0) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-start">
        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Expiring Soon</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            {expiringGrants.length} grant{expiringGrants.length !== 1 ? "s" : ""} expiring within 7 days
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpiringSoonWarning;

