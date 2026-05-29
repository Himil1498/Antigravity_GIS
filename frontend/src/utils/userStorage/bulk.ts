
import type { User } from '../../types/auth/index';
import { rolesMatch } from '../userHelpers';
import { STORAGE_KEYS } from './constants';
import { getUsersFromStorage, saveUsersToStorage } from './crud';

/**
 * Bulk update users in storage
 */
export const bulkUpdateUsersInStorage = (userIds: string[], updates: Partial<User>): boolean => {
  try {
    const users = getUsersFromStorage();
    const updatedUsers = users.map(user =>
      userIds.includes(user.id) ? { ...user, ...updates } : user
    );

    return saveUsersToStorage(updatedUsers);
  } catch (error) {
    console.error('Error bulk updating users in storage:', error);
    return false;
  }
};

/**
 * Bulk delete users from storage
 */
export const bulkDeleteUsersFromStorage = (userIds: string[]): boolean => {
  try {
    const users = getUsersFromStorage();
    const filteredUsers = users.filter(u => !userIds.includes(u.id));

    return saveUsersToStorage(filteredUsers);
  } catch (error) {
    console.error('Error bulk deleting users from storage:', error);
    return false;
  }
};

/**
 * Clear all users from storage (use with caution)
 */
export const clearUsersFromStorage = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USERS_LIST);
    return true;
  } catch (error) {
    console.error('Error clearing users from storage:', error);
    return false;
  }
};

/**
 * Initialize storage with default users if empty
 */
export const initializeUsersStorage = (defaultUsers: User[]): boolean => {
  try {
    const existingUsers = getUsersFromStorage();

    if (existingUsers.length === 0) {
      return saveUsersToStorage(defaultUsers);
    }

    return true;
  } catch (error) {
    console.error('Error initializing users storage:', error);
    return false;
  }
};

/**
 * Get storage statistics
 */
export const getStorageStats = () => {
  const users = getUsersFromStorage();

  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    inactiveUsers: users.filter(u => u.status === 'Inactive').length,
    adminCount: users.filter(u => rolesMatch(u.role, 'Admin')).length,
    managerCount: users.filter(u => rolesMatch(u.role, 'Manager')).length,
    technicianCount: users.filter(u => rolesMatch(u.role, 'Technician')).length,
    userCount: users.filter(u => rolesMatch(u.role, 'User')).length,
    storageSize: new Blob([JSON.stringify(users)]).size,
  };
};

/**
 * Export users data as JSON string
 */
export const exportUsersFromStorage = (): string => {
  const users = getUsersFromStorage();
  return JSON.stringify(users, null, 2);
};

/**
 * Import users data from JSON string
 */
export const importUsersToStorage = (jsonString: string, merge: boolean = false): boolean => {
  try {
    const importedUsers = JSON.parse(jsonString);

    if (!Array.isArray(importedUsers)) {
      console.error('Invalid data format: expected an array of users');
      return false;
    }

    if (merge) {
      const existingUsers = getUsersFromStorage();
      const mergedUsers = [...existingUsers];

      importedUsers.forEach((importedUser: User) => {
        const existingIndex = mergedUsers.findIndex(u => u.id === importedUser.id);
        if (existingIndex !== -1) {
          mergedUsers[existingIndex] = importedUser;
        } else {
          mergedUsers.push(importedUser);
        }
      });

      return saveUsersToStorage(mergedUsers);
    } else {
      return saveUsersToStorage(importedUsers);
    }
  } catch (error) {
    console.error('Error importing users to storage:', error);
    return false;
  }
};

