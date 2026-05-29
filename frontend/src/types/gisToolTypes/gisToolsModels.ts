
// ===================================
// Core Geometric Models
// ===================================

export interface DistanceMeasurement {
  id: string;
  name: string;
  points: Array<{
    lat: number;
    lng: number;
    label: string; // A, B, C, etc.
  }>;
  totalDistance: number; // in meters
  segments: Array<{
    distance: number; // in meters
    from: string; // point label
    to: string; // point label
  }>;
  createdAt: Date;
  updatedAt: Date;
  streetViewEnabled: boolean;
  color?: string;
  description?: string;
  // Elevation data (optional)
  elevation_data?: Array<{
    elevation: number; // in meters
    resolution: number;
    location: {
      lat: number;
      lng: number;
    };
    distance: number; // from start point in meters
  }>;
  min_elevation?: number;
  max_elevation?: number;
  elevation_gain?: number;
  elevation_loss?: number;
}

export interface SegmentElevation {
  from: string; // Point label (e.g., "A")
  to: string; // Point label (e.g., "B")
  fromElevation: number; // Starting elevation in meters
  toElevation: number; // Ending elevation in meters
  elevationChange: number; // Positive for gain, negative for loss
  gain: number; // Positive elevation change only
  loss: number; // Absolute value of negative elevation change
  grade: number; // Percentage grade (elevation change / distance * 100)
  distance: number; // Segment distance in meters
}

export interface PolygonData {
  id: string;
  name: string;
  vertices: Array<{
    lat: number;
    lng: number;
  }>;
  area: number; // in square meters
  perimeter: number; // in meters
  color: string;
  fillOpacity: number;
  strokeWeight: number;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

export interface CircleData {
  id: string;
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number; // in meters
  perimeter: number; // in meters
  area: number; // in square meters
  color: string;
  fillOpacity: number;
  strokeWeight: number;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

export interface ElevationProfile {
  id: string;
  name: string;
  points: Array<{
    lat: number;
    lng: number;
  }>;
  elevationData: Array<{
    elevation: number; // in meters
    resolution: number;
    location: {
      lat: number;
      lng: number;
    };
    distance: number; // from start point in meters
  }>;
  highPoint: {
    elevation: number;
    location: {
      lat: number;
      lng: number;
    };
  };
  lowPoint: {
    elevation: number;
    location: {
      lat: number;
      lng: number;
    };
  };
  totalDistance: number;
  elevationGain: number; // total ascent
  elevationLoss: number; // total descent
  bearing?: number | null; // 📐 Bearing/Azimuth angle from point A to B (0-360°, null for multi-point profiles)
  reverse_bearing?: number | null; // 📐 Bearing/Azimuth angle from point B to A (0-360°, null for multi-point profiles)
  graph: {
    type: 'line';
    data: any;
    options: any;
  };
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

export interface SectorRFData {
  id: string;
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number; // in meters
  azimuth: number; // direction in degrees (0-360, 0 = North)
  beamwidth: number; // angle width in degrees (e.g., 30, 60, 90, 120)

  // Tower/Site information
  towerId?: string;
  towerName?: string;
  sectorName?: string; // e.g., "Sector A", "Alpha"

  // RF Technical Details
  frequency?: number; // in MHz
  bandwidth?: number; // in MHz
  technology?: '2G' | '3G' | '4G' | '5G' | 'Wi-Fi' | 'Other';
  antennaHeight?: number; // in meters
  transmitPower?: number; // in dBm
  gain?: number; // antenna gain in dBi
  tilt?: number; // mechanical/electrical tilt in degrees

  // Coverage area calculations
  area: number; // in square meters
  arcLength: number; // length of the arc in meters

  // Visualization
  color: string;
  fillOpacity: number;
  strokeWeight: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  description?: string;
  status?: 'Active' | 'Inactive' | 'Planned' | 'Testing';
}

