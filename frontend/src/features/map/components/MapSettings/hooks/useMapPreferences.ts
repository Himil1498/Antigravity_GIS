/**
 * Custom hook for managing map preferences state
 * Handles view preferences (zoom, center, region, map type)
 */

import { useState, useEffect } from 'react';
import { DEFAULT_ZOOM_LEVEL, DEFAULT_MAP_TYPE, REGION_CENTERS } from '../constants';
import type { MapPreferences } from '../types';

export const useMapPreferences = (currentPreferences?: MapPreferences) => {
  const [defaultZoom, setDefaultZoom] = useState<number>(
    currentPreferences?.default_zoom || DEFAULT_ZOOM_LEVEL
  );
  const [defaultCenter, setDefaultCenter] = useState<{ lat: number; lng: number } | null>(
    currentPreferences?.default_center || null
  );
  const [defaultRegionId, setDefaultRegionId] = useState<number | null>(
    currentPreferences?.default_region_id || null
  );
  const [defaultMapType, setDefaultMapType] = useState<string>(
    currentPreferences?.default_map_type || DEFAULT_MAP_TYPE
  );
  const [useCurrentView, setUseCurrentView] = useState(false);

  // Update when currentPreferences prop changes
  useEffect(() => {
    if (currentPreferences) {
      setDefaultZoom(currentPreferences.default_zoom || DEFAULT_ZOOM_LEVEL);
      setDefaultCenter(currentPreferences.default_center);
      setDefaultRegionId(currentPreferences.default_region_id);
      setDefaultMapType(currentPreferences.default_map_type || DEFAULT_MAP_TYPE);
    }
  }, [currentPreferences]);

  const handleSaveCurrentView = (map: google.maps.Map | null) => {
    if (map) {
      const center = map.getCenter();
      const zoom = map.getZoom();

      if (center && zoom) {
        setDefaultCenter({ lat: center.lat(), lng: center.lng() });
        setDefaultZoom(zoom);
        setUseCurrentView(true);
      }
    }
  };

  const handleCenterOnRegion = (regionName: string) => {
    // Import REGION_CENTERS inside the file or at top level
    // For now assuming it is imported at top level
    const center = REGION_CENTERS[regionName];
    if (center) {
      setDefaultCenter(center);
      setDefaultZoom(8); // Appropriate zoom for state level
      setUseCurrentView(false);
    }
  };

  const resetToDefaults = () => {
    setDefaultZoom(DEFAULT_ZOOM_LEVEL);
    setDefaultCenter(null);
    setDefaultRegionId(null);
    setDefaultMapType(DEFAULT_MAP_TYPE);
    setUseCurrentView(false);
  };

  return {
    defaultZoom,
    defaultCenter,
    defaultRegionId,
    defaultMapType,
    useCurrentView,
    setDefaultZoom,
    setDefaultCenter,
    setDefaultRegionId,
    setDefaultMapType,
    setUseCurrentView,
    handleSaveCurrentView,
    handleCenterOnRegion,
    resetToDefaults
  };
};

