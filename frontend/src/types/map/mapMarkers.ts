
import type { Coordinates } from '../common/index';

// ===================================
// Markers and Overlays
// ===================================

export type MarkerType =
  | 'tower'
  | 'fiber_node'
  | 'base_station'
  | 'repeater'
  | 'poi'
  | 'user_location'
  | 'search_result'
  | 'waypoint'
  | 'custom';

export interface MarkerIcon {
  url?: string;
  scaledSize?: { width: number; height: number };
  anchor?: { x: number; y: number };
  origin?: { x: number; y: number };
  color?: string;
  fontColor?: string;
  fontSize?: number;
  fontWeight?: string;
  text?: string;
  svg?: string;
}

export interface InfoWindowData {
  content: string | React.ReactNode;
  maxWidth?: number;
  pixelOffset?: { x: number; y: number };
  zIndex?: number;
  closeButton?: boolean;
}

export interface MapMarker {
  id: string;
  position: Coordinates;
  title: string;
  description?: string;
  type: MarkerType;
  category?: string;
  icon?: MarkerIcon;
  visible: boolean;
  clickable: boolean;
  draggable: boolean;
  data?: Record<string, any>;
  infoWindow?: InfoWindowData;
  cluster?: boolean;
  zIndex?: number;
}

// ===================================
// Drawing and Geometry
// ===================================

export type ShapeType =
  | 'polygon'
  | 'polyline'
  | 'circle'
  | 'rectangle'
  | 'marker'
  | 'point'
  | 'multipoint'
  | 'linestring'
  | 'multilinestring'
  | 'multipolygon';

export interface ShapeStyle {
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
  clickable?: boolean;
  editable?: boolean;
  draggable?: boolean;
  geodesic?: boolean;
  icons?: google.maps.IconSequence[];
  visible?: boolean;
  zIndex?: number;
}

export interface DrawnShape {
  id: string;
  type: ShapeType;
  geometry: google.maps.Data.Geometry;
  properties: Record<string, any>;
  style: ShapeStyle;
  editable: boolean;
  draggable: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DrawingManagerState {
  isEnabled: boolean;
  drawingMode: google.maps.drawing.OverlayType | null;
  options: google.maps.drawing.DrawingManagerOptions;
}

