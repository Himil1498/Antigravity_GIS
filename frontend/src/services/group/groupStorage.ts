
import { STORAGE_KEY } from './constants';
import type { UserGroup } from './types';

/**
 * Get all user groups from localStorage
 */
export function getAllGroups(): UserGroup[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const groups = JSON.parse(stored);

    // Convert date strings back to Date objects
    return groups.map((group: any) => ({
      ...group,
      createdAt: new Date(group.createdAt),
      updatedAt: new Date(group.updatedAt)
    }));
  } catch (error) {
    console.error('Failed to load groups:', error);
    return [];
  }
}

/**
 * Save groups to localStorage
 */
export function saveGroups(groups: UserGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error('Failed to save groups:', error);
    throw error;
  }
}

