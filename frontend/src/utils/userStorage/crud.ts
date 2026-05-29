
import type { User } from '../../types/auth/index';
import { STORAGE_KEYS } from './constants';

/**
 * Get all users from localStorage
 */
export const getUsersFromStorage = (): User[] => {
  try {
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
    if (!usersJson) return [];

    const users = JSON.parse(usersJson);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error('Error reading users from storage:', error);
    return [];
  }
};

/**
 * Save users to localStorage
 */
export const saveUsersToStorage = (users: User[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error saving users to storage:', error);
    return false;
  }
};

/**
 * Add a new user to storage
 */
export const addUserToStorage = (user: User): boolean => {
  try {
    const users = getUsersFromStorage();

    // Check for duplicate ID
    const existingUser = users.find(u => u.id === user.id);
    if (existingUser) {
      console.warn('User with this ID already exists');
      return false;
    }

    users.push(user);
    return saveUsersToStorage(users);
  } catch (error) {
    console.error('Error adding user to storage:', error);
    return false;
  }
};

/**
 * Update a user in storage
 */
export const updateUserInStorage = (userId: string, updates: Partial<User>): boolean => {
  try {
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      console.warn('User not found');
      return false;
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    return saveUsersToStorage(users);
  } catch (error) {
    console.error('Error updating user in storage:', error);
    return false;
  }
};

/**
 * Delete a user from storage
 */
export const deleteUserFromStorage = (userId: string): boolean => {
  try {
    const users = getUsersFromStorage();
    const filteredUsers = users.filter(u => u.id !== userId);

    if (users.length === filteredUsers.length) {
      console.warn('User not found');
      return false;
    }

    return saveUsersToStorage(filteredUsers);
  } catch (error) {
    console.error('Error deleting user from storage:', error);
    return false;
  }
};

/**
 * Get a user by ID from storage
 */
export const getUserFromStorage = (userId: string): User | null => {
  try {
    const users = getUsersFromStorage();
    return users.find(u => u.id === userId) || null;
  } catch (error) {
    console.error('Error getting user from storage:', error);
    return null;
  }
};

/**
 * Get a user by email from storage
 */
export const getUserByEmailFromStorage = (email: string): User | null => {
  try {
    const users = getUsersFromStorage();
    return users.find(u => u.email === email) || null;
  } catch (error) {
    console.error('Error getting user by email from storage:', error);
    return null;
  }
};

/**
 * Get a user by username from storage
 */
export const getUserByUsernameFromStorage = (username: string): User | null => {
  try {
    const users = getUsersFromStorage();
    return users.find(u => u.username === username) || null;
  } catch (error) {
    console.error('Error getting user by username from storage:', error);
    return null;
  }
};

