/**
 * RevokeModal - Modal for revoking temporary access
 */

import React from "react";
import type { TemporaryRegionAccess } from "../types/types";

interface RevokeModalProps {
  isOpen: boolean;
  grant: TemporaryRegionAccess | null;
  revokeReason: string;
  setRevokeReason: (reason: string) => void;
  onRevoke: () => void;
  onClose: () => void;
  loading: boolean;
}

const RevokeModal: React.FC<RevokeModalProps> = ({
  isOpen,
  grant,
  revokeReason,
  setRevokeReason,
  onRevoke,
  onClose,
  loading
}) => {
  if (!isOpen || !grant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Revoke Temporary Access
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Revoking access for{" "}
          <span className="font-semibold">{grant.userName}</span> to{" "}
          <span className="font-semibold">{grant.region}</span>
        </p>
        <div className="mb-4">
          <label htmlFor="revokeReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason for Revocation (Optional)
          </label>
          <textarea
            id="revokeReason"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            rows={3}
            placeholder="Enter reason for revocation..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
            aria-label="Reason for revocation"
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
            onClick={onRevoke}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Revoking..." : "Revoke"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevokeModal;

