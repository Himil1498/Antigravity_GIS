
import type { User } from '../../types/auth/index';
import { logAuditEvent } from '../../services/audit/index';
import { hasTemporaryAccess, getMyActiveTemporaryAccess } from '../../services/temporaryAccess/index';
import { rolesMatch } from '../userHelpers';
import { INDIAN_STATES } from './constants';
import { detectStateFromCoordinates } from './geometry';

/**
 * Get assigned regions for a user (including active temporary access)
 */
export const getUserAssignedRegions = async (user: User | null): Promise<string[]> => {
  if (!user) return [];

  // Admin has access to all regions
  if (rolesMatch(user.role, 'Admin')) {
    return ['All India', ...INDIAN_STATES];
  }

  // Get permanent regions
  const permanentRegions = user.assignedRegions || [];

  // Get active temporary access regions
  try {
    const tempAccess = await getMyActiveTemporaryAccess();
    // Filter expired ones (double-check on frontend)
    const now = new Date();
    const activeGrants = tempAccess.filter(grant => new Date(grant.expiresAt) > now);
    const tempRegions = activeGrants.map(grant => grant.region);

    // Combine permanent and temporary (remove duplicates)
    const allRegions = Array.from(new Set([...permanentRegions, ...tempRegions]));
    return allRegions;
  } catch (error) {
    console.error('Error fetching temporary access:', error);
    // Return just permanent regions if temporary access fetch fails
    return permanentRegions;
  }
};

/**
 * Get assigned regions for a user (synchronous version - only permanent)
 * Use this when you need immediate access without async
 */
export const getUserAssignedRegionsSync = (user: User | null): string[] => {
  if (!user) return [];

  // Admin has access to all regions
  if (rolesMatch(user.role, 'Admin')) {
    return ['All India', ...INDIAN_STATES];
  }

  return user.assignedRegions || [];
};

/**
 * Check if user has access to a specific region
 */
export const hasRegionAccess = (user: User | null, region: string): boolean => {
  if (!user) return false;

  // Admin has access to all regions
  if (rolesMatch(user.role, 'Admin')) return true;

  return user.assignedRegions?.includes(region) || false;
};

/**
 * Normalize state names for comparison (handle variations in naming)
 */
export const normalizeStateName = (stateName: string): string => {
  const normalized = stateName.trim().toLowerCase();

  // Handle common variations
  const variations: Record<string, string> = {
    'nct of delhi': 'delhi',
    'national capital territory of delhi': 'delhi',
    'dadra and nagar haveli': 'dadra and nagar haveli and daman and diu',
    'daman and diu': 'dadra and nagar haveli and daman and diu',
    'andaman and nicobar': 'andaman and nicobar islands',
  };

  return variations[normalized] || normalized;
};

/**
 * Check if a point (lat, lng) is within user's assigned regions
 * Uses GeoJSON polygon data from india.json (no Geocoding API needed)
 */
export const isPointInAssignedRegion = async (
  lat: number,
  lng: number,
  user: User | null,
  geocoder?: google.maps.Geocoder
): Promise<{
  allowed: boolean;
  regionName: string | null;
  message: string;
}> => {
  // If no user, deny access
  if (!user) {
    return {
      allowed: false,
      regionName: null,
      message: 'User not authenticated'
    };
  }

  // Admin has access to all regions
  if (rolesMatch(user.role, 'Admin')) {
    return {
      allowed: true,
      regionName: 'All Regions (Admin)',
      message: 'Admin access granted'
    };
  }

  // Check if India GeoJSON is loaded
  if (!(window as any).indiaGeoJson || !(window as any).indiaGeoJson.features) {
    console.error('❌ India GeoJSON not loaded yet - GIS tools not ready');
    return {
      allowed: false,
      regionName: null,
      message: 'Map data is still loading. Please wait a moment and try again.'
    };
  }

  // Get user's assigned regions (use sync version here since we're already in async context)
  const assignedRegions = getUserAssignedRegionsSync(user);

  // If user has no assigned regions, deny access
  if (assignedRegions.length === 0) {
    return {
      allowed: false,
      regionName: null,
      message: 'No regions assigned to your account'
    };
  }

  // If user has all regions, allow access (shouldn't happen for non-admin, but just in case)
  if (assignedRegions.length === INDIAN_STATES.length) {
    return {
      allowed: true,
      regionName: 'All Regions',
      message: 'Full access granted'
    };
  }

  // Detect state from coordinates using GeoJSON polygon data
  try {
    const detectedRegion = detectStateFromCoordinates(lat, lng);

    if (!detectedRegion) {
      console.error('❌ Could not determine state from coordinates - point might be outside India or on border');
      return {
        allowed: false,
        regionName: null,
        message: 'Could not determine region from coordinates. Please try clicking inside a state (not on borders).'
      };
    }

    // Normalize region names for comparison
    const normalizedDetected = normalizeStateName(detectedRegion);

    // Check if detected region matches any assigned region
    const isAllowed = assignedRegions.some(assignedRegion => {
      const normalizedAssigned = normalizeStateName(assignedRegion);
      const matches = (
        normalizedDetected === normalizedAssigned ||
        normalizedDetected.includes(normalizedAssigned) ||
        normalizedAssigned.includes(normalizedDetected)
      );

      return matches;
    });

    // Also check for temporary access
    const hasTemp = await hasTemporaryAccess(user.id, detectedRegion);

    if (isAllowed || hasTemp) {
      // Log successful access
      const accessType = hasTemp && !isAllowed ? 'temporary' : 'permanent';
      logAuditEvent(user, 'REGION_ACCESS_GRANTED', `Access granted to ${detectedRegion} (${accessType})`, {
        severity: 'info',
        region: detectedRegion,
        details: { lat, lng, assignedRegions, accessType, temporaryAccess: hasTemp },
        success: true
      });

      return {
        allowed: true,
        regionName: detectedRegion,
        message: `Access granted to ${detectedRegion}${hasTemp && !isAllowed ? ' (Temporary Access)' : ''}`
      };
    } else {
      // Log denied access
      logAuditEvent(user, 'REGION_ACCESS_DENIED', `Access denied to ${detectedRegion}`, {
        severity: 'warning',
        region: detectedRegion,
        details: { lat, lng, assignedRegions, attemptedRegion: detectedRegion },
        success: false,
        errorMessage: `User attempted to access ${detectedRegion} without permission`
      });

      return {
        allowed: false,
        regionName: detectedRegion,
        message: `You don't have access to ${detectedRegion}. Assigned regions: ${assignedRegions.join(', ')}`
      };
    }
  } catch (error) {
    console.error('Error checking region access:', error);
    // On error, deny access for security
    return {
      allowed: false,
      regionName: null,
      message: 'Error verifying region access. Please refresh the page and try again.'
    };
  }
};

