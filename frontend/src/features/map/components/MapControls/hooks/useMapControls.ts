/**
 * Custom hook for map control operations
 * Handles zoom, reset to preferences, refresh, and map type changes
 */

import { useState } from 'react';
import { DEFAULT_ZOOM } from '../constants';
import { getIndiaBounds, getMapTypeMap, parseCenter } from '../utils';

export const useMapControls = (map: google.maps.Map | null) => {
  const [currentMapType, setCurrentMapType] = useState<string>('satellite');

  /**
   * Zoom In
   */
  const zoomIn = () => {
    if (!map) return;
    const currentZoom = map.getZoom() || DEFAULT_ZOOM;
    map.setZoom(currentZoom + 1);
  };

  /**
   * Zoom Out
   */
  const zoomOut = () => {
    if (!map) return;
    const currentZoom = map.getZoom() || DEFAULT_ZOOM;
    map.setZoom(currentZoom - 1);
  };

  /**
   * Resize map according to user's saved preferences from DB
   * If no preferences, fit to India bounds
   */
  const resetToPreferences = async () => {
    if (!map) return;

    try {
      const userMapPreferencesService = await import(
        '../../../../../services/user/userMapPreferencesService'
      );
      const prefs = await userMapPreferencesService.default.getUserPreferences();

      if (prefs) {
        // Apply user's saved map type
        if (prefs.default_map_type) {
          const mapTypeMap = getMapTypeMap();
          const mapType = mapTypeMap[prefs.default_map_type] || google.maps.MapTypeId.SATELLITE;
          map.setMapTypeId(mapType);
          setCurrentMapType(prefs.default_map_type);
        }

        // Apply user's saved center position
        if (prefs.default_center) {
          const center = parseCenter(prefs.default_center);
          map.setCenter(center);
        } else {
          // No saved center, fit to India bounds
          const indiaBounds = getIndiaBounds();
          map.fitBounds(indiaBounds);
        }

        // Apply user's saved zoom level
        if (prefs.default_zoom) {
          map.setZoom(prefs.default_zoom);
        }
      } else {
        // No preferences, use default India bounds
        const indiaBounds = getIndiaBounds();
        map.fitBounds(indiaBounds);
      }
    } catch (error) {
      console.error('Error loading user preferences, using default India bounds:', error);
      // Fallback to India bounds
      const indiaBounds = getIndiaBounds();
      map.fitBounds(indiaBounds);
    }
  };

  /**
   * Change Map Type
   */
  const changeMapType = (typeId: string) => {
    if (!map) return;
    map.setMapTypeId(typeId as google.maps.MapTypeId);
    setCurrentMapType(typeId);
  };

  return {
    currentMapType,
    zoomIn,
    zoomOut,
    resetToPreferences,
    changeMapType
  };
};

