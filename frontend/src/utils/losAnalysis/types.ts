
export interface LOSPoint {
  distance: number; // Distance from start in meters
  terrainElevation: number; // Ground elevation in meters
  surfaceElevation: number; // Terrain + obstacles/buildings
  losElevation: number; // LOS beam height at this point
  fresnelRadius: number; // First Fresnel zone radius
  fresnel60Radius: number; // 60% Fresnel zone radius (recommended clearance)
  isObstructed: boolean; // True if obstacle penetrates 60% Fresnel zone
  clearance: number; // Clearance in meters (negative = obstruction)
  obstruction?: {
    type: 'building' | 'tree' | 'tower' | 'pole' | 'terrain' | 'mast' | 'chimney';
    name?: string;
    height: number;
    penetration: number; // How much it penetrates Fresnel zone
  };
}

export interface LOSAnalysisResult {
  isClear: boolean; // True if path meets 60% Fresnel clearance
  clearancePercentage: number; // % of path that is clear
  worstClearance: number; // Minimum clearance (negative = worst obstruction)
  worstPoint: LOSPoint;
  points: LOSPoint[]; // All sample points with LOS data
  obstructions: Array<{
    distance: number;
    type: string;
    name?: string;
    penetration: number;
    clearance: number;
  }>;
  statistics: {
    totalDistance: number;
    clearPoints: number;
    obstructedPoints: number;
    averageClearance: number;
    buildingsDetected: number;
    obstaclesDetected: number;
  };
  alternativePaths?: AlternativePath[];
}

export interface AlternativePath {
  id: string;
  waypoints: Array<{ lat: number; lng: number }>;
  reason: string;
  improvement: string;
  strategy: 'increase_height' | 'add_relay' | 'route_around' | 'adjust_frequency';
  estimatedImprovement: number; // Percentage improvement
  additionalCost?: string;
}

