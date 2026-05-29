
export interface Building {
  id: string;
  osmId?: number;
  coordinates: Array<{ lat: number; lng: number }>;
  height: number;
  estimatedHeight: boolean;
  confidence: number; // 0-100
  levels?: number;
  type: string;
  name?: string;
  roofHeight?: number;
}

export interface Obstacle {
  id: string;
  type: 'tree' | 'tower' | 'mast' | 'pole' | 'chimney';
  location: { lat: number; lng: number };
  height: number;
  estimatedHeight: boolean;
  confidence: number;
  radius?: number;
  name?: string;
}

export interface BoundingBox {
  south: number;
  north: number;
  west: number;
  east: number;
}

export interface BuildingDataResult {
  buildings: Building[];
  obstacles: Obstacle[];
  coverage: {
    totalBuildings: number;
    buildingsWithHeight: number;
    estimatedBuildings: number;
    coveragePercentage: number;
    confidenceScore: number;
  };
  cached: boolean;
  dataSource: 'OSM' | 'Cache' | 'Manual';
}

export interface OSMElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  nodes?: number[];
  geometry?: Array<{ lat: number; lon: number }>; // For 'out geom;' queries
  tags?: {
    [key: string]: string;
  };
}

export interface OSMResponse {
  elements: OSMElement[];
}

