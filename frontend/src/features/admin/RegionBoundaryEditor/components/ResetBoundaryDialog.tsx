import React from "react";

interface ResetBoundaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  hasChanges: boolean;
  regionName?: string;
}

export const ResetBoundaryDialog: React.FC<ResetBoundaryDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  hasChanges,
  regionName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="bg-gradient-to-r from-rose-600 to-red-600 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Reset Boundary</h3>
              <p className="text-white/90 text-sm mt-0.5">
                Load india.json coordinates for {regionName}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-5 rounded-lg mb-6">
            <p className="text-gray-800 dark:text-gray-100 leading-relaxed mb-3">
              <span className="font-bold text-amber-600">?? WARNING:</span> This
              will discard all your current edits and restore the boundary to its
              original state from{" "}
              <span className="font-mono text-sm">india.json</span>.
              <br />
              <br />
              This action will:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">
              <li>
                Load the official boundary coordinates for{" "}
                <strong>{regionName}</strong>
              </li>
              <li>Discard all unsaved changes</li>
              <li>Reset the editing canvas</li>
              <li>Mark the boundary as modified (you'll need to save)</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-3">
              <strong>Note:</strong> Previous version history will NOT be
              deleted. You can save this as a new version.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </>
              ) : hasChanges ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Discard Changes & Reset
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Load from india.json
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 hover:border-gray-400 transition-all disabled:opacity-50 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

