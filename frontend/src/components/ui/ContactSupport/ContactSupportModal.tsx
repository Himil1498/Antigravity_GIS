import React from "react";
import { X } from "lucide-react";
import ContactSupportContent from "./ContactSupportContent";

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
  emailCopied,
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
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl text-left overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transform transition-all w-full max-w-xl">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-white">
                  Contact Support
                </h3>
                <p className="text-sm text-blue-100 mt-0.5">
                  We're here to help
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close contact support dialog"
              className="p-1.5 hover:bg-red-500 hover:text-white text-white/80 rounded-xl transition-all duration-300 group shadow-sm"
            >
              <X className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
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
