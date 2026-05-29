
import type { User } from '../../types/auth/index';

/**
 * Get map style for a region based on user access
 */
export const getRegionStyle = (
  region: string,
  userRegions: string[],
  isHighlighted: boolean = false
): google.maps.Data.StyleOptions => {
  const isAssigned = userRegions.includes(region);

  if (isHighlighted && isAssigned) {
    // Highlighted assigned region
    return {
      fillColor: '#3B82F6', // Blue
      fillOpacity: 0.5,
      strokeColor: '#1E40AF',
      strokeWeight: 2,
      strokeOpacity: 1
    };
  } else if (isAssigned) {
    // Assigned region (not highlighted)
    return {
      fillColor: '#60A5FA', // Light blue
      fillOpacity: 0.3,
      strokeColor: '#3B82F6',
      strokeWeight: 1.5,
      strokeOpacity: 0.8
    };
  } else {
    // Non-assigned region (dimmed)
    return {
      fillColor: '#9CA3AF', // Gray
      fillOpacity: 0.1,
      strokeColor: '#D1D5DB',
      strokeWeight: 0.5,
      strokeOpacity: 0.3,
      visible: true // Make non-assigned regions barely visible
    };
  }
};

/**
 * Create info window content for a region
 */
export const createRegionInfoContent = (
  regionName: string,
  isAssigned: boolean,
  user: User | null
): string => {
  const assignedText = isAssigned
    ? '<span class="text-green-600 font-semibold">✓ Assigned</span>'
    : '<span class="text-gray-400">Not Assigned</span>';

  return `
    <div class="p-3">
      <h3 class="font-bold text-lg mb-2">${regionName}</h3>
      <p class="text-sm mb-1">${assignedText}</p>
      ${isAssigned ? `
        <p class="text-xs text-gray-600 mt-2">
          You have access to manage towers and data in this region.
        </p>
      ` : `
        <p class="text-xs text-gray-400 mt-2">
          Contact your administrator for access to this region.
        </p>
      `}
    </div>
  `;
};

