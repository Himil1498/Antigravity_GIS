import React from "react";
import { ImpactAnalysis } from "../../../../services/region/index"; // Ensure this import is correct

interface QuickPublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  impactAnalysis: ImpactAnalysis | null;
  publishReason: string;
  setPublishReason: (reason: string) => void;
  publishing: boolean;
  setImpactAnalysis: (analysis: ImpactAnalysis | null) => void;
}

export const QuickPublishDialog: React.FC<QuickPublishDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  impactAnalysis,
  publishReason,
  setPublishReason,
  publishing,
  setImpactAnalysis,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 bg-opacity-20 rounded-xl">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Publish Boundary Changes
              </h3>
              <p className="text-white text-opacity-90 text-sm mt-0.5">
                Review impact and confirm publication
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Infrastructure Impact Analysis Removed */}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Publish Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={publishReason}
              onChange={(e) => setPublishReason(e.target.value)}
              placeholder="e.g., Updated boundary to match official survey data, Published after field verification..."
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={4}
              disabled={publishing}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose();
                setImpactAnalysis(null);
                setPublishReason("");
              }}
              disabled={publishing}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-all font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!publishReason.trim() || publishing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
            >
              {publishing ? (
                <span className="flex items-center justify-center gap-2">
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
                  Publishing...
                </span>
              ) : (
                "Confirm & Publish"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

