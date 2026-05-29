/**
 * Utility functions for MapControls feature
 */

import { INDIA_BOUNDS, getLocationMarkerIcon, LOCATION_MARKER_LABEL } from './constants';
import type { GeolocationPosition } from './types';

/**
 * Creates India geographical bounds
 */
export const getIndiaBounds = (): google.maps.LatLngBounds => {
  return new google.maps.LatLngBounds(
    new google.maps.LatLng(INDIA_BOUNDS.southwest.lat, INDIA_BOUNDS.southwest.lng),
    new google.maps.LatLng(INDIA_BOUNDS.northeast.lat, INDIA_BOUNDS.northeast.lng)
  );
};

/**
 * Result from creating a location marker with accuracy circle
 */
export interface LocationMarkerResult {
  marker: google.maps.Marker;
  circle: google.maps.Circle | null;
}

/**
 * Creates a location marker + accuracy circle on the map
 */
export const createLocationMarker = (
  map: google.maps.Map,
  position: GeolocationPosition,
  title: string
): LocationMarkerResult => {
  const marker = new google.maps.Marker({
    position,
    map,
    title,
    icon: getLocationMarkerIcon(),
    label: LOCATION_MARKER_LABEL,
    zIndex: 999,
  });

  // Accuracy circle — Google Earth style blue radius
  let circle: google.maps.Circle | null = null;
  const accuracyMeters = position.accuracy || 0;

  if (accuracyMeters > 0) {
    circle = new google.maps.Circle({
      map,
      center: position,
      radius: accuracyMeters,
      fillColor: '#4285F4',   // Google Blue
      fillOpacity: 0.12,
      strokeColor: '#4285F4',
      strokeOpacity: 0.4,
      strokeWeight: 1.5,
      clickable: false,
      zIndex: 1,
    });
  }

  return { marker, circle };
};

/**
 * Maps string map type to Google Maps MapTypeId
 */
export const getMapTypeMap = (): Record<string, google.maps.MapTypeId> => {
  return {
    'roadmap': google.maps.MapTypeId.ROADMAP,
    'satellite': google.maps.MapTypeId.SATELLITE,
    'hybrid': google.maps.MapTypeId.HYBRID,
    'terrain': google.maps.MapTypeId.TERRAIN
  };
};

/**
 * Parses center coordinates from user preferences
 */
export const parseCenter = (
  center: string | { lat: number; lng: number }
): { lat: number; lng: number } => {
  return typeof center === 'string' ? JSON.parse(center) : center;
};

