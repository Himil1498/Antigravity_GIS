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
    <div className="px-6 py-4">
      <div className="space-y-4 max-w-lg mx-auto">
        {/* Info Message */}
        <div className="bg-[#1e6fd9]/10 rounded-xl p-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-[#1e6fd9]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-[#0b1d3a] dark:text-blue-100 font-medium leading-relaxed">
              Contact our support team for assistance with your account or any technical issues.
            </p>
          </div>
        </div>

        {/* Primary Action - Open Outlook Web */}
        <div>
          <button
            onClick={onOpneOutlook}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#0b1d3a] to-[#1e6fd9] text-white font-bold rounded-xl hover:from-[#122950] hover:to-[#3d8ef0] transition-all duration-200 shadow-md shadow-blue-600/10 flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div className="text-left">
              <div className="text-base leading-tight">Open Outlook Web</div>
              <div className="text-[10px] text-blue-100 font-normal opacity-90">Compose email with pre-filled details</div>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="px-3 bg-white dark:bg-gray-900 text-gray-400 font-bold tracking-widest uppercase">
              Or Copy Email
            </span>
          </div>
        </div>

        {/* Email Copy Section */}
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-100 dark:border-gray-700/30">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
              <span className="text-xs font-mono text-gray-900 dark:text-white break-all">
                himil.chauhan@optimaltele.net
              </span>
            </div>
            <button
              onClick={onCopyEmail}
              className="w-full sm:w-auto px-4 py-2 bg-[#1e6fd9] text-white text-xs font-bold rounded-lg hover:bg-[#122950] transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              {emailCopied ? 'Copied' : 'Copy Email'}
            </button>
          </div>
        </div>

        {/* Help Categories */}
        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1e6fd9] flex-shrink-0"></div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                <span className="font-bold text-gray-900 dark:text-white mr-1.5">Account Access:</span>
                <span>Password resets, locked accounts, and recovery.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1e6fd9] flex-shrink-0"></div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                <span className="font-bold text-gray-900 dark:text-white mr-1.5">Technical:</span>
                <span>System bugs, errors, and connection issues.</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-[10px] text-gray-400 italic text-center">
              Typically responds within 24 hours on business days.
            </p>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full max-w-[160px] py-2 bg-[#0b1d3a] text-white font-bold rounded-lg hover:bg-[#122950] transition-all text-xs shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSupportContent;
