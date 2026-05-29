import React from 'react';

const LoginFormHeader: React.FC = () => {
  return (
    <div className="px-6 pt-6 pb-4">
      <div className="flex items-center gap-3.5">
        {/* Shield Icon Container */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-sky-600 dark:from-cyan-400 dark:to-sky-400 leading-tight">
            Secure Sign In
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-500/90 mt-0.5 font-semibold">
            Authenticate to access your dashboard
          </p>
        </div>
      </div>

      {/* Divider with subtle gradient */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
    </div>
  );
};

export default LoginFormHeader;
