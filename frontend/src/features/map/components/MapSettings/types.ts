/**
 * TypeScript type definitions for MapSettings feature
 */

export interface BoundarySettings {
  enabled: boolean;
  color: string;
  opacity: number;
  dimWhenToolActive: boolean;
  dimmedOpacity: number;
}

export interface MapPreferences {
  default_zoom: number;
  default_center: { lat: number; lng: number } | null;
  default_region_id: number | null;
  default_map_type?: string;
  boundary: BoundarySettings;
}

export interface MapSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BoundarySettings;
  onSettingsChange: (settings: BoundarySettings) => void;
  map: google.maps.Map | null;
  currentPreferences?: MapPreferences;
  onSaveAllPreferences?: (prefs: MapPreferences) => void;
}

export interface PresetColor {
  name: string;
  value: string;
  gradient: string;
}

export interface RegionCenter {
  lat: number;
  lng: number;
}

