
import {
  getZoneAssignments,
  saveZoneAssignments,
  getRegionZones
} from './regionHierarchyStorage';
import { logAuditEvent } from '../audit/index';
import type { User, ZoneAssignment } from './types';

/**
 * Assign zones to a user
 */
export const assignZonesToUser = (
  user: User,
  zoneIds: string[],
  assignedBy: User
): ZoneAssignment => {
  const assignments = getZoneAssignments();

  // Remove existing assignment for this user
  const filtered = assignments.filter(a => a.userId !== user.id);

  const assignment: ZoneAssignment = {
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    zoneIds,
    assignedBy: assignedBy.id,
    assignedByName: assignedBy.name,
    assignedAt: new Date()
  };

  filtered.push(assignment);
  saveZoneAssignments(filtered);

  const zones = getRegionZones();
  const zoneNames = zoneIds.map(id => zones.find(z => z.id === id)?.name || id).join(', ');

  logAuditEvent(assignedBy, 'REGION_ASSIGNED', `Assigned zones to ${user.name}: ${zoneNames}`, {
    severity: 'info',
    details: { userId: user.id, zoneIds, zoneNames },
    success: true
  });

  return assignment;
};

/**
 * Get user's zone assignment
 */
export const getUserZoneAssignment = (userId: string): ZoneAssignment | null => {
  const assignments = getZoneAssignments();
  return assignments.find(a => a.userId === userId) || null;
};

/**
 * Remove zone assignment from user
 */
export const removeZoneAssignment = (userId: string, removedBy: User): boolean => {
  const assignments = getZoneAssignments();
  const filtered = assignments.filter(a => a.userId !== userId);

  if (filtered.length === assignments.length) {
    return false; // No assignment found
  }

  saveZoneAssignments(filtered);

  logAuditEvent(removedBy, 'REGION_REVOKED', `Removed zone assignment from user`, {
    severity: 'warning',
    details: { userId },
    success: true
  });

  return true;
};

/**
 * Get all states from assigned zones for a user
 */
export const getStatesFromUserZones = (userId: string): string[] => {
  const assignments = getZoneAssignments().filter(a => a.userId === userId);
  const zones = getRegionZones();

  const states = new Set<string>();
  assignments.forEach(assignment => {
    assignment.zoneIds.forEach((zoneId: string) => {
      const zone = zones.find(z => z.id === zoneId);
      if (zone) {
        zone.states.forEach((state: string) => states.add(state));
      }
    });
  });

  return Array.from(states);
};

