/**
 * Form Actions Component
 * Location: Frontend/src/features/users/region-requests/RegionRequestForm/components/FormActions.tsx
 */

import React from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface FormActionsProps {
  loading: boolean;
  onClear: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ loading, onClear }) => {
  return (
    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={onClear}
        className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
      >
        Clear
      </button>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
      >
        <PaperAirplaneIcon className="h-5 w-5" />
        <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
      </button>
    </div>
  );
};

export default FormActions;

