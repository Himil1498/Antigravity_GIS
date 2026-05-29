
import type { UserGroup } from './types';
import { getAllGroups } from './groupStorage';
import { getGroupById, updateGroup } from './groupCoreService';

/**
 * Add a member to a group
 */
export function addMemberToGroup(groupId: string, userId: string): boolean {
  const group = getGroupById(groupId);
  if (!group) return false;

  if (group.members.includes(userId)) {
    return true; // Already a member
  }

  return updateGroup(groupId, {
    members: [...group.members, userId]
  }) !== null;
}

/**
 * Remove a member from a group
 */
export function removeMemberFromGroup(groupId: string, userId: string): boolean {
  const group = getGroupById(groupId);
  if (!group) return false;

  return updateGroup(groupId, {
    members: group.members.filter(id => id !== userId)
  }) !== null;
}

/**
 * Get groups by member user ID
 */
export function getGroupsByMember(userId: string): UserGroup[] {
  const groups = getAllGroups();
  return groups.filter(g => g.members.includes(userId));
}

/**
 * Get groups by manager user ID
 */
export function getGroupsByManager(userId: string): UserGroup[] {
  const groups = getAllGroups();
  return groups.filter(g => g.managers.includes(userId));
}

/**
 * Check if user is a member of a group
 */
export function isGroupMember(groupId: string, userId: string): boolean {
  const group = getGroupById(groupId);
  return group ? group.members.includes(userId) : false;
}

/**
 * Check if user is a manager of a group
 */
export function isGroupManager(groupId: string, userId: string): boolean {
  const group = getGroupById(groupId);
  return group ? group.managers.includes(userId) : false;
}

/**
 * Get member count for a group
 */
export function getGroupMemberCount(groupId: string): number {
  const group = getGroupById(groupId);
  return group ? group.members.length : 0;
}

