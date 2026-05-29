import React from 'react';
import ContactSupportContent from './ContactSupportContent';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOutlook: () => void;
  onCopyEmail: () => void;
  emailCopied: boolean;
}

const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  isOpen,
  onClose,
  onOpenOutlook,
  onCopyEmail,
  emailCopied
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-0">
      {/* Background overlay */}
      <div
        className="fixed inset-0 transition-opacity bg-gray-900/75 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className="relative bg-white/70 dark:bg-gray-900/50 backdrop-blur-md rounded-2xl text-left overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transform transition-all w-full max-w-md border border-white/60 dark:border-gray-700/50">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-sky-600 dark:from-cyan-500 dark:to-sky-500 px-6 py-4">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-white">
                  Contact Support
                </h3>
                <p className="text-sm text-cyan-100 mt-0.5">
                  We're here to help
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close contact support dialog"
              className="text-white hover:text-cyan-100 transition-colors"
            >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <ContactSupportContent
            onOpneOutlook={onOpenOutlook}
            onCopyEmail={onCopyEmail}
            emailCopied={emailCopied}
            onClose={onClose}
          />
      </div>
    </div>
  );
};

export default ContactSupportModal;

