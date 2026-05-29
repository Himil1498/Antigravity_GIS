
import { getGroupById, updateGroup } from './groupCoreService';

/**
 * Add permissions to a group
 */
export function addPermissionsToGroup(
  groupId: string,
  permissions: string[]
): boolean {
  const group = getGroupById(groupId);
  if (!group) return false;

  const uniquePermissions = Array.from(
    new Set([...group.permissions, ...permissions])
  );

  return updateGroup(groupId, {
    permissions: uniquePermissions
  }) !== null;
}

/**
 * Remove permissions from a group
 */
export function removePermissionsFromGroup(
  groupId: string,
  permissions: string[]
): boolean {
  const group = getGroupById(groupId);
  if (!group) return false;

  return updateGroup(groupId, {
    permissions: group.permissions.filter(p => !permissions.includes(p))
  }) !== null;
}

/**
 * Assign regions to a group
 */
export function assignRegionsToGroup(
  groupId: string,
  regions: string[]
): boolean {
  return updateGroup(groupId, {
    assignedRegions: regions
  }) !== null;
}

