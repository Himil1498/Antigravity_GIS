export interface ElevationDataPoint {
  elevation: number;
  resolution: number;
  location: { lat: number; lng: number };
  distance: number;
}

export interface ElevationChartProps {
  elevationData: ElevationDataPoint[];
  totalDistance: number;
  pointToIndexMap: Map<string, number>;
  highPoint: any;
  lowPoint: any;
  hasLOSData: boolean;
  losAnalysis?: any;
}

