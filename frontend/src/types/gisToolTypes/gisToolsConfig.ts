import {
  DistanceMeasurement,
  PolygonData,
  CircleData,
  ElevationProfile,
  SectorRFData,
} from "./gisToolsModels";
import { Infrastructure } from "./gisToolsImports";

// ===================================
// Tool Configuration Types
// ===================================

export type GISToolType =
  | "distance"
  | "polygon"
  | "circle"
  | "elevation"
  | "infrastructure"
  | "sectorRF"
  | "measurementSuite"
  | "none";

export interface GISToolsState {
  distanceMeasurements: DistanceMeasurement[];
  polygons: PolygonData[];
  circles: CircleData[];
  elevationProfiles: ElevationProfile[];
  infrastructures: Infrastructure[];
  sectorRFs: SectorRFData[];

  // Active tool
  activeTool: GISToolType | null;

  // Selected items
  selectedItem: {
    type: GISToolType;
    id: string;
  } | null;
}

export interface ToolAction {
  type: "create" | "edit" | "delete" | "view" | "undo";
  toolType: GISToolType;
  data?: any;
}

export interface ToolConfig {
  distanceMeasurement: {
    defaultColor: string;
    showLabels: boolean;
    streetViewEnabled: boolean;
    maxPoints: number;
  };
  polygon: {
    defaultColor: string;
    defaultFillOpacity: number;
    defaultStrokeWeight: number;
    minVertices: number;
  };
  circle: {
    defaultColor: string;
    defaultFillOpacity: number;
    defaultStrokeWeight: number;
    minRadius: number;
    maxRadius: number;
  };
  elevation: {
    samplePoints: number;
    chartHeight: number;
    showGrid: boolean;
  };
  infrastructure: {
    iconMapping: {
      POP: string;
      "Sub POP": string;
      "BTS-CO-LO": string;
      "Bandwidth BTS": string;
      "Office Location": string;
      NNI: string;
      "Data Center": string;
      Customer: string;
    };
  };
  sectorRF: {
    defaultColor: string;
    defaultFillOpacity: number;
    defaultStrokeWeight: number;
    defaultRadius: number; // in meters
    defaultBeamwidth: number; // in degrees
    minRadius: number;
    maxRadius: number;
    presetBeamwidths: number[]; // e.g., [30, 60, 90, 120, 180]
  };
}

// ===================================
// Chart Configuration
// ===================================

export interface GisChartConfig {
  type: "line" | "bar" | "scatter";
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      fill?: boolean;
    }>;
  };
  options: {
    responsive: boolean;
    maintainAspectRatio: boolean;
    scales?: any;
    plugins?: any;
  };
}

