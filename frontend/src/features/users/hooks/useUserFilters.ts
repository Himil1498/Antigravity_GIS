/**
 * User Filters Hook
 * Manages filter state for user list
 */

import { useState, useCallback, useMemo } from 'react';
import { User } from '../../../types/auth/index';
import { filterUsers } from '../helpers/userHelpers';

export const useUserFilters = (users: User[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredUsers = useMemo(
    () => filterUsers(users, searchTerm, filterRole, filterStatus),
    [users, searchTerm, filterRole, filterStatus]
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterRole('');
    setFilterStatus('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filteredUsers,
    handleClearFilters
  };
};


