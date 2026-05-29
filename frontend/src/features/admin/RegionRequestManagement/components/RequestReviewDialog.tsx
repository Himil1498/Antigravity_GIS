/**
 * Request Review Dialog Component
 * Modal dialog for approving or rejecting region requests
 */

import React from 'react';
import type { RegionAccessRequest } from '../types/types';

interface RequestReviewDialogProps {
  isOpen: boolean;
  request: RegionAccessRequest | null;
  action: 'approve' | 'reject' | null;
  reviewNotes: string;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const RequestReviewDialog: React.FC<RequestReviewDialogProps> = ({
  isOpen,
  request,
  action,
  reviewNotes,
  onNotesChange,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !request || !action) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {action === 'approve' ? 'Approve' : 'Reject'} Request
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>User:</strong> {request.userName} ({request.userEmail})
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <strong>Requested Regions:</strong>
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {request.requestedRegions.map((region: string) => (
                <span
                  key={region}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs"
                >
                  {region}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <strong>Reason:</strong> {request.reason}
            </p>
          </div>

          <div>
            <label
              htmlFor="reviewNotes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Review Notes (Optional)
            </label>
            <textarea
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add notes about your decision..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              action === 'approve'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestReviewDialog;

