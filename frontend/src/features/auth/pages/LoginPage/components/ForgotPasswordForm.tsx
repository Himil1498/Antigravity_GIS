import React from 'react';
import { X } from 'lucide-react';

interface ForgotPasswordFormProps {
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  username: string;
  onUsernameChange: (val: string) => void;
  reason: string;
  onReasonChange: (val: string) => void;
  isSending: boolean;
  error: string;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  onClose,
  username,
  onUsernameChange,
  reason,
  onReasonChange,
  isSending,
  error
}) => {
  return (
    <>
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-[#0b1d3a] to-[#1e6fd9] dark:from-[#0b1d3a] dark:to-[#1e6fd9] px-6 py-4">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-white">
                Password Reset Request
              </h3>
              <p className="text-sm text-blue-100 mt-0.5">
                Admin will assist you shortly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close password reset dialog"
            className="p-1.5 hover:bg-red-500 hover:text-white text-white/80 rounded-xl transition-all duration-300 group shadow-sm"
          >
            <X className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
          </button>
        </div>
      </div>

      {/* Modal Body */}
      <form onSubmit={onSubmit} className="px-6 py-6">
        <div className="space-y-5">
          {/* Info Message */}
          <div className="bg-[#1e6fd9]/10 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-[#1e6fd9] dark:text-[#3d8ef0]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-[#0b1d3a] dark:text-blue-100 font-medium">
                  Your administrator will receive a notification and create a
                  new password for your account.
                </p>
              </div>
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label
              htmlFor="forgot-username"
              className="block text-sm font-bold text-[#0b1d3a] dark:text-blue-100 mb-2"
            >
              Your Username or Email{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400 dark:text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="forgot-username"
                type="text"
                required
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                className="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium text-gray-900 dark:text-white bg-gray-50/80 dark:bg-gray-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                placeholder="Enter your username or email"
              />
            </div>
          </div>

          {/* Reason Field (Optional) */}
          <div>
            <label
              htmlFor="forgot-reason"
              className="block text-sm font-bold text-[#0b1d3a] dark:text-blue-100 mb-2"
            >
              Reason (Optional)
            </label>
            <textarea
              id="forgot-reason"
              rows={3}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium text-gray-900 dark:text-white bg-gray-50/80 dark:bg-gray-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 resize-none"
              placeholder="Why do you need a password reset? (optional)"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 dark:bg-red-500/10 backdrop-blur-sm p-4 animate-shake">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500 dark:text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-red-800 dark:text-red-200">
                  Request Failed
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-[#0b1d3a] text-white font-bold rounded-xl hover:bg-[#122950] focus:outline-none transition-all duration-200 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSending || !username.trim()}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#0b1d3a] to-[#1e6fd9] text-white font-bold rounded-xl hover:from-[#122950] hover:to-[#3d8ef0] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm flex items-center justify-center shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 dark:focus:ring-offset-gray-900"
          >
            {isSending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending Request...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send Request to Admin
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default ForgotPasswordForm;

