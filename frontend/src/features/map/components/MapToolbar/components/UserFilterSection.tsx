/**
 * User Filter Section Component (Compact)
 * Inline filter row for admin/manager to filter layers by user
 */

import React from 'react';
import { rolesMatch } from '../../../../../utils/userHelpers';
import type { UserOption } from '../types';

interface UserFilterSectionProps {
  userFilter: 'me' | 'all' | 'user';
  selectedUserId?: number;
  usersList: UserOption[];
  isLoadingUsers: boolean;
  onUserFilterChange?: (filter: 'me' | 'all' | 'user') => void;
  onSelectedUserIdChange?: (userId: number | undefined) => void;
}

const UserFilterSection: React.FC<UserFilterSectionProps> = ({
  userFilter,
  selectedUserId,
  usersList,
  isLoadingUsers,
  onUserFilterChange,
  onSelectedUserIdChange
}) => {
  const currentValue = userFilter === 'all' ? 'all' : selectedUserId?.toString() || 'me';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      onUserFilterChange?.('all');
      onSelectedUserIdChange?.(undefined);
    } else if (value === 'me') {
      onUserFilterChange?.('me');
      onSelectedUserIdChange?.(undefined);
    } else {
      const userId = parseInt(value);
      onUserFilterChange?.('user');
      onSelectedUserIdChange?.(userId);
    }
  };

  return (
    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
      <span className="w-6 flex-shrink-0 text-center text-lg">👤</span>
      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
        Filter:
      </span>
      <select
        value={currentValue}
        onChange={handleChange}
        disabled={isLoadingUsers}
        className="flex-1 text-xs font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer appearance-none truncate"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '14px', paddingRight: '24px' }}
      >
        <option value="me">👤 My Data Only</option>
        <option value="all">👥 All Users</option>
        {usersList.map((u) => (
          <option key={u.id} value={u.id.toString()}>
            {rolesMatch(u.role, 'admin') ? '👑' : rolesMatch(u.role, 'manager') ? '👔' : '👤'}{' '}
            {u.full_name || u.username}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserFilterSection;
