/**
 * Custom hook for loading and managing users list (Admin/Manager only)
 * Handles fetching users from API and loading state
 */

import { useState, useEffect } from 'react';
import { useAppSelector } from '../../../../../store/index';
import * as apiService from '../../../../../services/api/index';
import type { UserOption } from '../types';

export const useUsersList = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const currentUserRole = (user?.role || '').toLowerCase().trim();
  const isAdminOrManager = currentUserRole === 'admin' || currentUserRole === 'manager';

  useEffect(() => {
    if (isAdminOrManager) {
      loadUsersList();
    }
  }, [isAdminOrManager]);

  const loadUsersList = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await apiService.getUsersList();
      if (response && response.success && Array.isArray(response.users)) {
        setUsersList(response.users);
      }
      setIsLoadingUsers(false);
    } catch (error) {
      console.error('Error loading users list:', error);
      setIsLoadingUsers(false);
    }
  };

  return {
    usersList,
    isLoadingUsers,
    isAdminOrManager
  };
};

