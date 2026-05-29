import React from 'react';
import { ImpactAnalysis } from '../../../../services/region/index';

interface ImpactAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: ImpactAnalysis | null;
  isLoading: boolean;
}

export const ImpactAnalysisDialog: React.FC<ImpactAnalysisDialogProps> = ({
  isOpen,
  onClose,
  data,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Impact Analysis
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : data ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-green-700">Ready to Publish</div>
                  <div className="text-sm text-green-600">Boundary changes are valid and ready to be applied.</div>
                </div>
                
                {data.summary.affectedUsersCount > 0 && (
                  <p className="text-sm text-gray-500 italic mt-2 text-center">
                    {data.summary.affectedUsersCount} users will be notified of these changes.
                  </p>
                )}
              </div>
            ) : (
                <p className="text-gray-500">No impact analysis data available.</p>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

