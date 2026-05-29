import React from "react";

interface CloseWarningDialogProps {
  handleCloseWithoutSaving: () => void;
  setShowCloseWarning: (show: boolean) => void;
  handleCloseSaveData: () => void;
}

const CloseWarningDialog: React.FC<CloseWarningDialogProps> = ({
  handleCloseWithoutSaving,
  setShowCloseWarning,
  handleCloseSaveData
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <svg
            className="w-6 h-6 text-yellow-500 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Unsaved Changes
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You have an unsaved elevation profile on the map. Do you want to
          save this data before closing?
        </p>
        <div className="flex space-x-3">
          <button
            onClick={handleCloseWithoutSaving}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Discard
          </button>
          <button
            onClick={() => {
              setShowCloseWarning(false);
              window.dispatchEvent(new CustomEvent('cancelGISToolClose'));
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleCloseSaveData}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloseWarningDialog;

