
import type { UserGroup, GroupData, GroupUpdateData } from './types';
import { getAllGroups, saveGroups } from './groupStorage';

/**
 * Get a single group by ID
 */
export function getGroupById(id: string): UserGroup | null {
  const groups = getAllGroups();
  return groups.find(g => g.id === id) || null;
}

/**
 * Create a new group
 */
export function createGroup(groupData: GroupData): UserGroup {
  const groups = getAllGroups();

  const newGroup: UserGroup = {
    ...groupData,
    id: `group_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  groups.push(newGroup);
  saveGroups(groups);

  return newGroup;
}

/**
 * Update an existing group
 */
export function updateGroup(
  id: string,
  updates: GroupUpdateData
): UserGroup | null {
  const groups = getAllGroups();
  const index = groups.findIndex(g => g.id === id);

  if (index === -1) {
    console.error('Group not found:', id);
    return null;
  }

  groups[index] = {
    ...groups[index],
    ...updates,
    id: groups[index].id, // Preserve ID
    createdAt: groups[index].createdAt, // Preserve creation date
    createdBy: groups[index].createdBy, // Preserve creator
    updatedAt: new Date()
  };

  saveGroups(groups);
  return groups[index];
}

/**
 * Delete a group
 */
export function deleteGroup(id: string): boolean {
  const groups = getAllGroups();
  const filteredGroups = groups.filter(g => g.id !== id);

  if (filteredGroups.length === groups.length) {
    console.error('Group not found:', id);
    return false;
  }

  saveGroups(filteredGroups);
  return true;
}

/**
 * Search groups by name or description
 */
export function searchGroups(query: string): UserGroup[] {
  const groups = getAllGroups();
  const lowercaseQuery = query.toLowerCase();

  return groups.filter(
    g =>
      g.name.toLowerCase().includes(lowercaseQuery) ||
      g.description.toLowerCase().includes(lowercaseQuery)
  );
}

