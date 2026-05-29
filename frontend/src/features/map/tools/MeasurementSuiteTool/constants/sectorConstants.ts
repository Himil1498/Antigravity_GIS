/**
 * Constants for SectorRFTool feature
 */

import type { PresetOption } from '../types/sectorTypes';

/**
 * Preset radius options
 */
export const PRESET_RADII: PresetOption[] = [
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '2km', value: 2000 },
  { label: '5km', value: 5000 },
  { label: '10km', value: 10000 }
];

/**
 * Preset beamwidth options
 */
export const PRESET_BEAMWIDTHS: PresetOption[] = [
  { label: '30°', value: 30 },
  { label: '60°', value: 60 },
  { label: '90°', value: 90 },
  { label: '120°', value: 120 },
  { label: '180°', value: 180 }
];

/**
 * Default sector parameters
 */
export const DEFAULT_RADIUS = 1000; // meters
export const DEFAULT_AZIMUTH = 0; // degrees (North)
export const DEFAULT_BEAMWIDTH = 60; // degrees
export const DEFAULT_COLOR = '#FF5722';
export const DEFAULT_FILL_OPACITY = 0.4;

/**
 * Earth radius in meters (for geographic calculations)
 */
export const EARTH_RADIUS = 6371000;

/**
 * Number of segments for smooth sector arc
 */
export const SECTOR_ARC_SEGMENTS = 30;

