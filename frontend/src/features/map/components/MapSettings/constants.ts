/**
 * Constants for MapSettings feature
 */

import type { PresetColor, RegionCenter, BoundarySettings } from './types';

/**
 * Preset color options for boundary styling
 */
export const PRESET_COLORS: PresetColor[] = [
  { name: 'Blue', value: '#3B82F6', gradient: 'from-blue-400 to-blue-600' },
  { name: 'Green', value: '#10B981', gradient: 'from-green-400 to-green-600' },
  { name: 'Purple', value: '#8B5CF6', gradient: 'from-purple-400 to-purple-600' },
  { name: 'Red', value: '#EF4444', gradient: 'from-red-400 to-red-600' },
  { name: 'Orange', value: '#F59E0B', gradient: 'from-orange-400 to-orange-600' },
  { name: 'Pink', value: '#EC4899', gradient: 'from-pink-400 to-pink-600' },
  { name: 'Cyan', value: '#06B6D4', gradient: 'from-cyan-400 to-cyan-600' },
  { name: 'Indigo', value: '#6366F1', gradient: 'from-indigo-400 to-indigo-600' }
];

/**
 * Region centers mapping (approximate centers for major Indian states)
 */
export const REGION_CENTERS: Record<string, RegionCenter> = {
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
  'Arunachal Pradesh': { lat: 28.2180, lng: 94.7278 },
  'Assam': { lat: 26.2006, lng: 92.9376 },
  'Bihar': { lat: 25.0961, lng: 85.3131 },
  'Chhattisgarh': { lat: 21.2787, lng: 81.8661 },
  'Goa': { lat: 15.2993, lng: 74.1240 },
  'Gujarat': { lat: 22.2587, lng: 71.1924 },
  'Haryana': { lat: 29.0588, lng: 76.0856 },
  'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 },
  'Jharkhand': { lat: 23.6102, lng: 85.2799 },
  'Karnataka': { lat: 15.3173, lng: 75.7139 },
  'Kerala': { lat: 10.8505, lng: 76.2711 },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
  'Maharashtra': { lat: 19.7515, lng: 75.7139 },
  'Manipur': { lat: 24.6637, lng: 93.9063 },
  'Meghalaya': { lat: 25.4670, lng: 91.3662 },
  'Mizoram': { lat: 23.1645, lng: 92.9376 },
  'Nagaland': { lat: 26.1584, lng: 94.5624 },
  'Odisha': { lat: 20.9517, lng: 85.0985 },
  'Punjab': { lat: 31.1471, lng: 75.3412 },
  'Rajasthan': { lat: 27.0238, lng: 74.2179 },
  'Sikkim': { lat: 27.5330, lng: 88.5122 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
  'Telangana': { lat: 18.1124, lng: 79.0193 },
  'Tripura': { lat: 23.9408, lng: 91.9882 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
  'Uttarakhand': { lat: 30.0668, lng: 79.0193 },
  'West Bengal': { lat: 22.9868, lng: 87.8550 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Jammu and Kashmir': { lat: 33.7782, lng: 76.5762 },
  'Ladakh': { lat: 34.1526, lng: 77.5771 },
  'Andaman and Nicobar Islands': { lat: 11.7401, lng: 92.6586 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794 },
  'Dadra and Nagar Haveli and Daman and Diu': { lat: 20.1809, lng: 73.0169 },
  'Lakshadweep': { lat: 10.5667, lng: 72.6417 },
  'Puducherry': { lat: 11.9416, lng: 79.8083 }
};

/**
 * Default boundary settings
 */
export const DEFAULT_BOUNDARY_SETTINGS: BoundarySettings = {
  enabled: true,
  color: '#3B82F6',
  opacity: 0.5,
  dimWhenToolActive: true,
  dimmedOpacity: 0.2
};

/**
 * Default zoom level
 */
export const DEFAULT_ZOOM_LEVEL = 10;

/**
 * Default map type
 */
export const DEFAULT_MAP_TYPE = 'satellite';

/**
 * Region-level zoom
 */
export const REGION_ZOOM_LEVEL = 8;

