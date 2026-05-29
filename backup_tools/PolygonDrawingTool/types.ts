/**
 * Types for Polygon Drawing Tool
 */

export interface PolygonDrawingToolProps {
  map: google.maps.Map | null;
  onSave?: (polygon: PolygonData) => void;
  onClose?: () => void;
  containerStyle?: React.CSSProperties;
}

export interface PolygonData {
  id: string;
  name: string;
  vertices: Array<{ lat: number; lng: number }>;
  area: number;
  perimeter: number;
  color: string;
  fillOpacity: number;
  strokeWeight: number;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

export interface Notification {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export interface PolygonSaveData {
  polygon_name: string;
  coordinates: Array<{ lat: number; lng: number }>;
  area: number;
  perimeter: number;
  fill_color: string;
  stroke_color: string;
  opacity: number;
  notes: string;
}

