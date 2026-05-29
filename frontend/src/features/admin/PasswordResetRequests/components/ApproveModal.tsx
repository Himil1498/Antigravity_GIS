import React from "react";
import { PasswordResetRequest } from "../index";

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PasswordResetRequest | null;
  newPassword: string;
  setNewPassword: (pwd: string) => void;
  confirmPassword: string;
  setConfirmPassword: (pwd: string) => void;
  reviewNote: string;
  setReviewNote: (note: string) => void;
  onGeneratePassword: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

const ApproveModal: React.FC<ApproveModalProps> = ({
  isOpen,
  onClose,
  request,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  reviewNote,
  setReviewNote,
  onGeneratePassword,
  onSubmit,
  isProcessing
}) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Approve Password Reset
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Set a new password for{" "}
          <strong>
            {request.full_name || request.username_or_email}
          </strong>
        </p>

        <div className="space-y-4">
          {/* Generate Password Button */}
          <button
            onClick={onGeneratePassword}
            type="button"
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            🎲 Generate Secure Password
          </button>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              New Password *
            </label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter new password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password *
            </label>
            <input
              type="text"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Confirm new password"
              required
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Add a note about this approval..."
            />
          </div>
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
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Approve & Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveModal;

