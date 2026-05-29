import React from "react";
import { PasswordResetRequest } from "../index";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../utils/utils";

interface RequestsListProps {
  requests: PasswordResetRequest[];
  onApprove: (request: PasswordResetRequest) => void;
  onReject: (request: PasswordResetRequest) => void;
  onDelete: (id: number) => void;
}

const RequestsList: React.FC<RequestsListProps> = ({
  requests,
  onApprove,
  onReject,
  onDelete
}) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          No requests found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            {/* Left Side - Request Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-3xl">
                  {request.user_id ? "👤" : "❓"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {request.full_name ||
                      request.username ||
                      request.username_or_email}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {request.email || request.username_or_email}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>

              <div className="space-y-2 text-sm">
                {request.reason && (
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Reason:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {request.reason}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Requested:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatDate(request.requested_at)}
                    </p>
                  </div>
                  {request.ip_address && (
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        IP Address:
                      </span>
                      <p className="text-gray-600 dark:text-gray-400">
                        {request.ip_address}
                      </p>
                    </div>
                  )}
                </div>

                {request.reviewed_by && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Reviewed by:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {request.reviewer_name} on{" "}
                      {formatDate(request.reviewed_at!)}
                    </p>
                    {request.review_note && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1 italic">
                        Note: {request.review_note}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="ml-6 flex flex-col space-y-2">
              {request.status === "pending" && (
                <>
                  <button
                    onClick={() => onApprove(request)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => onReject(request)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    ✕ Reject
                  </button>
                </>
              )}
              <button
                onClick={() => onDelete(request.id)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-colors"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequestsList;

