import React from "react";

interface SaveBoundaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSaveAndPublish: () => void;
  changeReason: string;
  setChangeReason: (reason: string) => void;
  saving: boolean;
  analyzingImpact: boolean;
}

export const SaveBoundaryDialog: React.FC<SaveBoundaryDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onSaveAndPublish,
  changeReason,
  setChangeReason,
  saving,
  analyzingImpact,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 transform transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Save Boundary Changes
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-5 leading-relaxed">
          Please provide a detailed reason for this boundary modification. This
          will be logged in the audit trail for future reference.
        </p>

        <textarea
          value={changeReason}
          onChange={(e) => setChangeReason(e.target.value)}
          placeholder="e.g., Corrected boundary based on latest survey data, Fixed coordinate inaccuracies identified during field verification..."
          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6 transition-all resize-none"
          rows={5}
          autoFocus
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving || analyzingImpact}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-all font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!changeReason.trim() || saving || analyzingImpact}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 dark:from-blue-700 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={onSaveAndPublish}
            disabled={!changeReason.trim() || saving || analyzingImpact}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
          >
            {analyzingImpact ? "Analyzing..." : "Save & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
};

