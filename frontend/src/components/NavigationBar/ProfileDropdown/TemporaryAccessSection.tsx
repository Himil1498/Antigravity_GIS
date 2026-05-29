import React from "react";
import { TemporaryRegionAccess } from '../../../types/temporaryAccess.types';

interface TemporaryAccessSectionProps {
  tempAccessGrants: TemporaryRegionAccess[];
}

const TemporaryAccessSection: React.FC<TemporaryAccessSectionProps> = ({ tempAccessGrants }) => {
  if (tempAccessGrants.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-amber-50/50 dark:bg-amber-900/10">
      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center">
        <svg
          className="w-4 h-4 mr-1.5 animate-pulse"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Temporary Access ({tempAccessGrants.length})
      </p>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {tempAccessGrants.map((grant) => (
          <div
            key={grant.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-2.5 border border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate flex items-center">
                  <svg
                    className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {grant.region}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Expires:{" "}
                  {new Date(grant.expiresAt).toLocaleString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex-shrink-0">
                {grant.timeRemaining && !grant.timeRemaining.expired ? (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                      grant.timeRemaining.days === 0 && grant.timeRemaining.hours === 0
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 animate-pulse"
                        : grant.timeRemaining.days === 0
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    }`}
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {grant.timeRemaining.display}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    Expired
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemporaryAccessSection;

