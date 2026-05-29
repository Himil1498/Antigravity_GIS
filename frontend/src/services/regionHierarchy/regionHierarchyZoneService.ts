
import {
  getRegionZones,
  saveZones,
  getZoneAssignments,
  saveZoneAssignments
} from './regionHierarchyStorage';
import { logAuditEvent } from '../audit/index';
import { DEFAULT_ZONES } from './constants';
import type { RegionZone, User } from './types';

/**
 * Initialize default zones if not exists
 */
export const initializeDefaultZones = (user: User): void => {
  const existing = getRegionZones();
  if (existing.length === 0) {
    DEFAULT_ZONES.forEach(zone => {
      createRegionZone(zone.name, zone.description, zone.states, zone.color, user);
    });
  }
};

/**
 * Create a new region zone
 */
export const createRegionZone = (
  name: string,
  description: string,
  states: string[],
  color: string,
  createdBy: User
): RegionZone => {
  const zone: RegionZone = {
    id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    states,
    color,
    createdBy: createdBy.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const zones = getRegionZones();
  zones.push(zone);
  saveZones(zones);

  logAuditEvent(createdBy, 'REGION_ASSIGNED', `Created region zone: ${name}`, {
    severity: 'info',
    details: { zoneId: zone.id, states, color },
    success: true
  });

  return zone;
};

/**
 * Update a region zone
 */
export const updateRegionZone = (
  zoneId: string,
  updates: Partial<Pick<RegionZone, 'name' | 'description' | 'states' | 'color'>>,
  updatedBy: User
): RegionZone | null => {
  const zones = getRegionZones();
  const zone = zones.find(z => z.id === zoneId);

  if (!zone) return null;

  Object.assign(zone, updates, { updatedAt: new Date() });
  saveZones(zones);

  logAuditEvent(updatedBy, 'REGION_ASSIGNED', `Updated region zone: ${zone.name}`, {
    severity: 'info',
    details: { zoneId, updates },
    success: true
  });

  return zone;
};

/**
 * Delete a region zone
 */
export const deleteRegionZone = (zoneId: string, deletedBy: User): boolean => {
  const zones = getRegionZones();
  const index = zones.findIndex(z => z.id === zoneId);

  if (index === -1) return false;

  const zone = zones[index];
  zones.splice(index, 1);
  saveZones(zones);

  // Also remove zone assignments
  const assignments = getZoneAssignments();
  const updatedAssignments = assignments.filter(a => !a.zoneIds.includes(zoneId));
  saveZoneAssignments(updatedAssignments);

  logAuditEvent(deletedBy, 'REGION_REVOKED', `Deleted region zone: ${zone.name}`, {
    severity: 'warning',
    details: { zoneId },
    success: true
  });

  return true;
};

/**
 * Get zone by ID
 */
export const getZoneById = (zoneId: string): RegionZone | null => {
  const zones = getRegionZones();
  return zones.find(z => z.id === zoneId) || null;
};

/**
 * Get zone statistics
 */
export const getZoneStats = (): {
  totalZones: number;
  totalStates: number;
  zonesByStateCount: Array<{ zone: RegionZone; stateCount: number }>;
  assignmentCount: number;
} => {
  const zones = getRegionZones();
  const assignments = getZoneAssignments();

  const allStates = new Set<string>();
  zones.forEach(zone => {
    zone.states.forEach((state: string) => allStates.add(state));
  });

  const zonesByStateCount = zones
    .map(zone => ({ zone, stateCount: zone.states.length }))
    .sort((a, b) => b.stateCount - a.stateCount);

  return {
    totalZones: zones.length,
    totalStates: allStates.size,
    zonesByStateCount,
    assignmentCount: assignments.length
  };
};

