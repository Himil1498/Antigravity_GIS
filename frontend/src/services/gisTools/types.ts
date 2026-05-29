
export interface DistanceMeasurement {
  id?: number;
  user_id?: number;
  region_id?: number;
  measurement_name: string;
  points: Array<{ lat: number; lng: number }>;
  total_distance: number;
  unit?: 'meters' | 'kilometers' | 'miles';
  map_snapshot_url?: string;
  notes?: string;
  is_saved?: boolean;
  created_at?: string;
  updated_at?: string;
  // Elevation data (optional)
  elevation_data?: Array<{
    elevation: number;
    resolution: number;
    location: { lat: number; lng: number };
    distance: number;
  }>;
  min_elevation?: number;
  max_elevation?: number;
  elevation_gain?: number;
  elevation_loss?: number;
  // Frontend fields
  createdBy?: string;
  username?: string;
}

export interface PolygonDrawing {
  id?: number;
  user_id?: number;
  region_id?: number;
  polygon_name: string;
  coordinates: Array<{ lat: number; lng: number }>;
  area?: number;
  perimeter?: number;
  fill_color: string;
  stroke_color: string;
  opacity: number;
  properties?: Record<string, any>;
  notes?: string;
  is_saved?: boolean;
  created_at?: string;
  updated_at?: string;
  // Frontend fields
  createdBy?: string;
  username?: string;
}

export interface CircleDrawing {
  id?: number;
  user_id?: number;
  region_id?: number;
  circle_name: string;
  center_lat: number;
  center_lng: number;
  radius: number;
  fill_color: string;
  stroke_color: string;
  opacity: number;
  properties?: Record<string, any>;
  notes?: string;
  is_saved?: boolean;
  created_at?: string;
  updated_at?: string;
  // Frontend fields
  createdBy?: string;
  username?: string;
}

export interface SectorRF {
  id?: number;
  user_id?: number;
  region_id?: number;
  sector_name: string;
  tower_lat: number;
  tower_lng: number;
  azimuth: number;
  beamwidth: number;
  radius: number;
  frequency: number;
  power?: number;
  antenna_height?: number;
  antenna_type?: string;
  fill_color: string;
  stroke_color: string;
  opacity: number;
  properties?: Record<string, any>;
  notes?: string;
  is_saved?: boolean;
  created_at?: string;
  updated_at?: string;
  // Frontend fields
  createdBy?: string;
  username?: string;
}

export interface ElevationProfile {
  id?: number;
  user_id?: number;
  region_id?: number;
  profile_name: string;
  start_point: { lat: number; lng: number };
  end_point: { lat: number; lng: number };
  elevation_data: Array<{ distance: number; elevation: number; lat: number; lng: number }>;
  total_distance: number;
  max_elevation: number;
  min_elevation: number;
  elevation_gain?: number;
  elevation_loss?: number;
  bearing?: number | null; // 📐 Bearing/Azimuth angle from point A to B (0-360°, null for multi-point)
  reverse_bearing?: number | null; // 📐 Bearing/Azimuth angle from point B to A (0-360°, null for multi-point)
  points?: Array<{ lat: number; lng: number }>;
  // ✨ LOS Analysis Fields
  building_data?: any[] | null;
  obstacle_data?: any[] | null;
  los_analysis?: any | null;
  antenna_height_1?: number;
  antenna_height_2?: number;
  rf_frequency?: number;
  notes?: string;
  is_saved?: boolean;
  created_at?: string;
  updated_at?: string;
  // Frontend fields
  createdBy?: string;
  username?: string;
}

export interface Infrastructure {
  id?: number;
  user_id?: number;
  region_id?: number;
  item_name: string;
  item_type: string;
  latitude: number;
  longitude: number;
  properties?: Record<string, any>;
  notes?: string;
  is_saved?: boolean;
  created_at?: string;
  updated_at?: string;
  // Frontend fields
  createdBy?: string;
  username?: string;
}

export interface GISToolsFilters {
  userId?: number | 'all' | 'me';
  regionId?: number;
  page?: number;
  limit?: number;
  search?: string;
}

