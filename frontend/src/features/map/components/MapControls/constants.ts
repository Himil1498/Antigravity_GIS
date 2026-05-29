/**
 * Constants for MapControls feature
 */

import type { MapType, MarkerIconConfig } from './types';

/**
 * Available map types for selection
 */
export const MAP_TYPES: MapType[] = [
  { id: 'roadmap', name: 'Roadmap', icon: '🗺️' },
  { id: 'satellite', name: 'Satellite', icon: '🛰️' },
  { id: 'hybrid', name: 'Hybrid', icon: '🌍' },
  { id: 'terrain', name: 'Terrain', icon: '⛰️' }
];

/**
 * India geographical bounds (South-West to North-East)
 */
export const INDIA_BOUNDS = {
  southwest: { lat: 7.0, lng: 68.5 },
  northeast: { lat: 35.0, lng: 97.0 }
};

/**
 * Default zoom level for user location
 * Increased to 18 for street-level detail
 */
export const USER_LOCATION_ZOOM = 18;

/**
 * Default zoom level for map initialization
 */
export const DEFAULT_ZOOM = 5;

/**
 * Location marker icon configuration
 * Returns a simple red map pin
 */
export const getLocationMarkerIcon = (): google.maps.Symbol => ({
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  fillColor: '#ef4444', // Red
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
  scale: 2,
  anchor: new google.maps.Point(12, 22),
  labelOrigin: new google.maps.Point(12, -10)
});

/**
 * Simple red label style
 */
export const LOCATION_MARKER_LABEL: google.maps.MarkerLabel = {
  text: "You Are Here",
  color: "#ef4444", // Red
  fontSize: "12px",
  fontWeight: "bold",
  className: "gis-you-are-here-label"
};
