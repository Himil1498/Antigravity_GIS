
import type { MarkerIcon, ShapeStyle } from './mapMarkers';

// ===================================
// Clustering
// ===================================

export interface ClusterStyle {
  url?: string;
  width: number;
  height: number;
  textColor: string;
  textSize: number;
  fontWeight?: string;
  fontFamily?: string;
  backgroundPosition?: string;
}

export interface ClusteringConfig {
  enabled: boolean;
  maxZoom: number;
  gridSize: number;
  minimumClusterSize: number;
  styles: ClusterStyle[];
  averageCenter: boolean;
  zoomOnClick: boolean;
}

// ===================================
// Heatmap
// ===================================

export interface HeatmapConfig {
  enabled: boolean;
  gradient: string[];
  maxIntensity: number;
  opacity: number;
  radius: number;
  dissipating: boolean;
  weightedLocations: google.maps.visualization.WeightedLocation[];
}

// ===================================
// Layers
// ===================================

export type LayerType =
  | 'markers'
  | 'polygons'
  | 'polylines'
  | 'heatmap'
  | 'tile'
  | 'wms'
  | 'geojson'
  | 'kml'
  | 'traffic'
  | 'transit'
  | 'bicycling'
  | 'custom';

export interface LayerSource {
  type: 'geojson' | 'kml' | 'tile' | 'wms' | 'api' | 'static';
  url?: string;
  data?: any;
  parameters?: Record<string, any>;
  refreshInterval?: number;
}

export interface LayerStyle {
  markers?: {
    icon?: MarkerIcon;
    size?: number;
    color?: string;
  };
  polygons?: ShapeStyle;
  polylines?: ShapeStyle;
  tiles?: {
    opacity?: number;
    tileSize?: number;
  };
}

export interface LayerFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  logical?: 'and' | 'or';
}

export interface MapLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  zIndex: number;
  source: LayerSource;
  style?: LayerStyle;
  filter?: LayerFilter;
  clustering?: ClusteringConfig;
  heatmap?: HeatmapConfig;
  data?: any[];
  metadata: Record<string, any>;
}

