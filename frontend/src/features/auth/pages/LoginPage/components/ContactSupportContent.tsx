import React from 'react';

interface ContactSupportContentProps {
  onOpneOutlook: () => void;
  onCopyEmail: () => void;
  emailCopied: boolean;
  onClose: () => void;
}

const ContactSupportContent: React.FC<ContactSupportContentProps> = ({
  onOpneOutlook,
  onCopyEmail,
  emailCopied,
  onClose
}) => {
  return (
    <div className="px-6 py-6">
      <div className="space-y-5">
        {/* Info Message */}
        <div className="bg-cyan-50/80 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800/50 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-cyan-600 dark:text-cyan-400"
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
              <p className="text-sm text-cyan-800 dark:text-cyan-200 font-medium">
                Contact our support team for assistance with your account or any
                technical issues.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action - Open Outlook Web */}
        <div>
          <button
            onClick={onOpneOutlook}
            className="w-full px-5 py-4 bg-gradient-to-r from-cyan-600 to-sky-600 dark:from-cyan-500 dark:to-sky-500 text-white font-bold rounded-xl hover:from-cyan-700 hover:to-sky-700 dark:hover:from-cyan-600 dark:hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 shadow-lg shadow-cyan-600/20 hover:shadow-xl hover:shadow-cyan-600/30 transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-center">
              <svg
                className="h-6 w-6 mr-3"
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
              <div className="text-left">
                <div className="text-base">Open Outlook Web</div>
                <div className="text-xs text-cyan-100 font-normal">
                  Compose email in browser with pre-filled details
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm text-cyan-600 dark:text-cyan-400 font-bold tracking-wider">
              OR COPY EMAIL
            </span>
          </div>
        </div>

        {/* Email Display */}
        <div>
          <label className="block text-sm font-bold text-cyan-900 dark:text-cyan-300 mb-2">
            Support Email Address
          </label>
          <div className="relative">
            <div className="flex items-center bg-gray-50/80 dark:bg-gray-800/60 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
              <svg
                className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-sm font-mono text-gray-900 dark:text-white flex-1 break-all">
                himil.chauhan@optimaltele.net
              </span>
            </div>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={onCopyEmail}
          className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50 font-bold rounded-xl hover:bg-cyan-50 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center shadow-sm"
        >
          {emailCopied ? (
            <>
              <svg
                className="h-5 w-5 mr-2 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-green-600 dark:text-green-400">
                Email Copied to Clipboard!
              </span>
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
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy to Clipboard
            </>
          )}
        </button>

        {/* Additional Info */}
        <div className="bg-gray-50/80 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg
              className="h-4 w-4 mr-2 text-cyan-600 dark:text-cyan-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            What We Can Help With:
          </h4>
          <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
            <div className="flex items-start">
              <span className="text-cyan-600 dark:text-cyan-400 mr-2 font-bold">
                •
              </span>
              <span>
                <strong>Account Access:</strong> Password resets, locked
                accounts, username recovery
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-cyan-600 dark:text-cyan-400 mr-2 font-bold">
                •
              </span>
              <span>
                <strong>Technical Issues:</strong> Login errors, system bugs,
                connection problems
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-cyan-600 dark:text-cyan-400 mr-2 font-bold">
                •
              </span>
              <span>
                <strong>Response Time:</strong> Typically within 24 hours on
                business days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Close Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onClose}
          className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-sm shadow-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ContactSupportContent;

