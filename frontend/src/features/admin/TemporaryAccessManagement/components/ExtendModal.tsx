/**
 * ExtendModal - Modal for extending temporary access
 */

import React from "react";
import type { TemporaryRegionAccess } from "../types/types";
import { formatDate } from "../utils/utils";

interface ExtendModalProps {
  isOpen: boolean;
  grant: TemporaryRegionAccess | null;
  newExpirationDate: string;
  setNewExpirationDate: (date: string) => void;
  onExtend: () => void;
  onClose: () => void;
  loading: boolean;
}

const ExtendModal: React.FC<ExtendModalProps> = ({
  isOpen,
  grant,
  newExpirationDate,
  setNewExpirationDate,
  onExtend,
  onClose,
  loading
}) => {
  if (!isOpen || !grant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Extend Temporary Access
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Extending access for{" "}
          <span className="font-semibold">{grant.userName}</span> to{" "}
          <span className="font-semibold">{grant.region}</span>
        </p>
        <div className="mb-4">
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Expiration: {formatDate(grant.expiresAt)}
          </p>
          <label htmlFor="newExpirationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Expiration Date & Time *
          </label>
          <input
            id="newExpirationDate"
            type="datetime-local"
            value={newExpirationDate}
            onChange={(e) => setNewExpirationDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            aria-label="New expiration date and time"
            required
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onExtend}
            disabled={loading || !newExpirationDate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Extending..." : "Extend"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtendModal;

