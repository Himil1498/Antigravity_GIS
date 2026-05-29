import React from 'react';

interface UserManagementBulkActionsProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

const UserManagementBulkActions: React.FC<UserManagementBulkActionsProps> = ({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 border-2 border-violet-200 dark:border-violet-700 rounded-xl p-5 mb-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold text-violet-800 dark:text-violet-200">
              {selectedCount} user(s) selected
            </span>
            <p className="text-xs text-violet-600 dark:text-violet-400">Choose a bulk action</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onActivate}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Activate
          </button>
          <button
            onClick={onDeactivate}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Deactivate
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-semibold hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementBulkActions;

