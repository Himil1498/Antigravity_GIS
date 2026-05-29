import React from 'react';
import { X } from 'lucide-react';

interface ForgotPasswordSuccessProps {
  onClose: () => void;
  username: string;
}

const ForgotPasswordSuccess: React.FC<ForgotPasswordSuccessProps> = ({
  onClose,
  username
}) => {
  return (
    <>
      {/* Success Message */}
      <div className="bg-gradient-to-r from-[#059669] to-[#10b981] dark:from-[#059669] dark:to-[#10b981] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <svg
                className="h-6 w-6 text-white"
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
            <div className="ml-4">
              <h3 className="text-xl font-bold text-white">
                Request Sent Successfully!
              </h3>
              <p className="text-sm text-emerald-50 mt-0.5">
                Administrator has been notified
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close success dialog"
            className="p-1.5 hover:bg-red-500 hover:text-white text-white/80 rounded-xl transition-all duration-300 group shadow-sm"
          >
            <X className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="space-y-4">
          {/* Success Details */}
          <div className="bg-emerald-500/10 dark:bg-emerald-500/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                  What happens next?
                </h4>
                <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1.5">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Administrator will receive your password reset request
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      They will verify your identity and create a new password
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      You'll receive your new credentials shortly
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Please contact support if you don't hear back within 24
                      hours
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50/80 dark:bg-gray-800/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Request for:
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {username}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Submitted:
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-3 bg-[#0b1d3a] text-white font-bold rounded-xl hover:bg-[#122950] focus:outline-none transition-all duration-200 text-sm shadow-lg shadow-black/10"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordSuccess;

