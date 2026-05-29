import { Region, Boundary, ImpactAnalysis } from "../../../../services/region/index";

export interface RegionBoundaryEditorProps {
  regionId: number;
  onClose?: () => void;
}

export interface PolygonCoordinates {
  type: "Polygon";
  coordinates: number[][][]; // [rings][points][lng, lat]
}

export interface MultiPolygonCoordinates {
  type: "MultiPolygon";
  coordinates: number[][][][]; // [polygons][rings][points][lng, lat]
}

export type GeoJSONGeometry = PolygonCoordinates | MultiPolygonCoordinates;

export interface HistoryState {
  lat: number;
  lng: number;
}

