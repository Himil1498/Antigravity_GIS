/**
 * TypeScript type definitions for MapControls feature
 */

export interface MapControlsPanelProps {
  map: google.maps.Map | null;
  onOpenSettings?: () => void;
  hideLocation?: boolean;
  hideResetView?: boolean;
}

export interface MapType {
  id: string;
  name: string;
  icon: string;
}

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy?: number; // Accuracy radius in meters
}

export interface UserMapPreferences {
  default_map_type?: string;
  default_center?: string | { lat: number; lng: number };
  default_zoom?: number;
}

export interface MarkerIconConfig {
  path: google.maps.SymbolPath;
  scale: number;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWeight: number;
}

