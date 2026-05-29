import React, { useState, useEffect } from "react";
import { X, Trash2, AlertTriangle, Loader2, Link } from "lucide-react";
import { networkPlanningService } from "../../services/api";

interface DeleteFeatureModalProps {
  isOpen: boolean;
  featureId: number;
  featureName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteFeatureModal: React.FC<DeleteFeatureModalProps> = ({
  isOpen,
  featureId,
  featureName,
  onClose,
  onSuccess,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      await networkPlanningService.deleteFeature(featureId);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete feature");
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-500 to-orange-500">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Move to Recycle Bin?
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-red-700 rounded-lg transition-all duration-300 group shadow-sm"
          >
            <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Feature Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Feature
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {featureName || `Feature #${featureId}`}
            </p>
          </div>



          {/* Info about restore */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ℹ️ This item will be moved to the Recycle Bin. You can restore it
              later if needed.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Moving to Bin...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Move to Recycle Bin
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFeatureModal;

