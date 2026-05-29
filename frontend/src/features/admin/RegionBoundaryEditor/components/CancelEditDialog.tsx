import React from "react";

interface CancelEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelEditDialog: React.FC<CancelEditDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 bg-opacity-20 rounded-xl flex items-center justify-center">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Unsaved Changes</h3>
              <p className="text-white text-opacity-90 text-sm mt-0.5">
                Confirm cancellation
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-5 rounded-lg mb-6">
            <p className="text-gray-800 dark:text-gray-100 leading-relaxed mb-3">
              <span className="font-bold text-amber-600">?? Warning:</span> You
              have unsaved changes to the boundary.
              <br />
              <br />
              If you cancel now,{" "}
              <span className="font-bold">all your edits will be lost</span>.
              This action cannot be undone.
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                What will be lost:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                <li>All vertex modifications</li>
                <li>Polygon shape changes</li>
                <li>Unsaved boundary adjustments</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-4">
              ?? <span className="font-semibold">Tip:</span> Consider saving as
              a draft first if you want to preserve your work.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl transition-all hover:shadow-lg font-bold"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Yes, Discard Changes
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3.5 bg-white dark:bg-gray-800 border-2 border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700 dark:bg-gray-900 hover:border-slate-400 dark:hover:border-gray-500 transition-all font-semibold"
            >
              Keep Editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

