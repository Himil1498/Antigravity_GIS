
import { RegionZone, ZoneAssignment } from './types';
import { ZONES_STORAGE_KEY, ZONE_ASSIGNMENTS_STORAGE_KEY } from './constants';

/**
 * Get all region zones
 */
export const getRegionZones = (): RegionZone[] => {
  try {
    const data = localStorage.getItem(ZONES_STORAGE_KEY);
    if (!data) return [];

    const zones = JSON.parse(data);
    return zones.map((zone: any) => ({
      ...zone,
      createdAt: new Date(zone.createdAt),
      updatedAt: new Date(zone.updatedAt)
    }));
  } catch (error) {
    console.error('Failed to load region zones:', error);
    return [];
  }
};

/**
 * Save zones to localStorage
 */
export const saveZones = (zones: RegionZone[]): void => {
  try {
    localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(zones));
  } catch (error) {
    console.error('Failed to save region zones:', error);
  }
};

/**
 * Get zone assignments
 */
export const getZoneAssignments = (): ZoneAssignment[] => {
  try {
    const data = localStorage.getItem(ZONE_ASSIGNMENTS_STORAGE_KEY);
    if (!data) return [];

    const assignments = JSON.parse(data);
    return assignments.map((assignment: any) => ({
      ...assignment,
      assignedAt: new Date(assignment.assignedAt)
    }));
  } catch (error) {
    console.error('Failed to load zone assignments:', error);
    return [];
  }
};

/**
 * Save zone assignments to localStorage
 */
export const saveZoneAssignments = (assignments: ZoneAssignment[]): void => {
  try {
    localStorage.setItem(ZONE_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
  } catch (error) {
    console.error('Failed to save zone assignments:', error);
  }
};

