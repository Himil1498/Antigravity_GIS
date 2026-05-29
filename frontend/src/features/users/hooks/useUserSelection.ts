/**
 * User Selection Hook
 * Manages user selection state for bulk operations
 */

import { useState, useCallback } from 'react';
import { User } from '../../../types/auth/index';

export const useUserSelection = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleUserSelect = useCallback((userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleSelectAll = useCallback((filteredUsers: User[]) => {
    setSelectedUsers(prev => {
      if (prev.length === filteredUsers.length) {
        return [];
      } else {
        return filteredUsers.map(user => user.id);
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  return {
    selectedUsers,
    handleUserSelect,
    handleSelectAll,
    clearSelection
  };
};


