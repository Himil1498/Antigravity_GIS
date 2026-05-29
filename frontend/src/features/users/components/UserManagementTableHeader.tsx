import React from 'react';

interface UserManagementTableHeaderProps {
  isAllSelected: boolean;
  onSelectAll: () => void;
}

const UserManagementTableHeader: React.FC<UserManagementTableHeaderProps> = ({
  isAllSelected,
  onSelectAll,
}) => {
  return (
    <thead className="bg-gradient-to-r from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-800/20">
      <tr>
        <th className="px-4 py-4 text-left">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAll}
            aria-label="Select all users"
            className="h-5 w-5 rounded border-violet-300 dark:border-violet-600 text-violet-600 focus:ring-violet-500"
          />
        </th>
        <th className="px-4 py-4 text-center text-[11px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            User ID
          </div>
        </th>
        <th className="px-4 py-4 text-center text-[11px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Name
          </div>
        </th>
        <th className="px-4 py-4 text-center text-[11px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </div>
        </th>
        <th className="px-4 py-4 text-center text-[11px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Role
          </div>
        </th>
        <th className="px-4 py-4 text-center text-[11px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Status
          </div>
        </th>
        <th className="px-4 py-4 text-center text-[11px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Verification
          </div>
        </th>
        <th className="px-4 py-4 text-center text-[11px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            2FA Status
          </div>
        </th>
        <th className="px-4 py-4 text-center text-[11px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Assigned Regions
          </div>
        </th>
        <th className="px-4 py-4 text-center text-[11px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Temporary Access
          </div>
        </th>
        <th className="px-4 py-4 text-center text-[11px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Actions
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default UserManagementTableHeader;

