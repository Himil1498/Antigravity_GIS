import React from "react";
import { PasswordResetRequest } from "../index";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PasswordResetRequest | null;
  reviewNote: string;
  setReviewNote: (note: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  request,
  reviewNote,
  setReviewNote,
  onSubmit,
  isProcessing
}) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Reject Password Reset
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Reject request from{" "}
          <strong>
            {request.full_name || request.username_or_email}
          </strong>
        </p>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Reason for Rejection (Optional)
          </label>
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Explain why this request is being rejected..."
          />
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Reject Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;

