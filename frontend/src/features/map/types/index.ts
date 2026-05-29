export interface LayerState {
  Distance: LayerData;
  Polygon: LayerData;
  Circle: LayerData;
  Elevation: LayerData;

  SectorRF: LayerData;
  RegionBoundaries: LayerData & { monochrome?: boolean };
}

export interface LayerData {
  visible: boolean;
  count: number;
  overlays: any[];
}

export interface BoundarySettings {
  enabled: boolean;
  color: string;
  opacity: number;
  dimWhenToolActive: boolean;
  dimmedOpacity: number;
  selectedRegion?: string;
}

export interface ViewOnMapOverlayState {
  overlays: any[];
  type: string;
  data?: any;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

