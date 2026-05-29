
import type { Coordinates, BoundingBox } from '../common/index';

// ===================================
// Search and Geocoding
// ===================================

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  position: Coordinates;
  type: string;
  placeId?: string;
  rating?: number;
  photos?: string[];
  metadata: Record<string, any>;
}

export interface GeocodingResult {
  address: string;
  position: Coordinates;
  formattedAddress: string;
  addressComponents: google.maps.GeocoderAddressComponent[];
  types: string[];
  placeId: string;
  accuracy: number;
}

export interface SearchConfiguration {
  types: string[];
  bounds?: BoundingBox;
  location?: Coordinates;
  radius?: number;
  strictBounds?: boolean;
  language?: string;
  region?: string;
}

// ===================================
// Routing and Directions
// ===================================

export interface RouteStep {
  distance: string;
  duration: string;
  instructions: string;
  startLocation: Coordinates;
  endLocation: Coordinates;
  travelMode: google.maps.TravelMode;
  polyline: string;
}

export interface RouteLeg {
  distance: string;
  duration: string;
  startAddress: string;
  endAddress: string;
  startLocation: Coordinates;
  endLocation: Coordinates;
  steps: RouteStep[];
}

export interface RouteInfo {
  summary: string;
  distance: string;
  duration: string;
  legs: RouteLeg[];
  bounds: google.maps.LatLngBounds;
  polyline: string;
  warnings: string[];
  fare?: {
    currency: string;
    value: number;
    text: string;
  };
}

export interface RouteRequest {
  origin: Coordinates | string;
  destination: Coordinates | string;
  waypoints?: Array<{
    location: Coordinates | string;
    stopover: boolean;
  }>;
  travelMode: google.maps.TravelMode;
  avoidHighways?: boolean;
  avoidTolls?: boolean;
  avoidFerries?: boolean;
  optimizeWaypoints?: boolean;
}

export interface RouteResult {
  routes: RouteInfo[];
  status: google.maps.DirectionsStatus;
}

// ===================================
// Measurement Tools
// ===================================

export interface MeasurementResult {
  type: 'distance' | 'area' | 'elevation';
  value: number;
  unit: string;
  formattedValue: string;
  coordinates: Coordinates[];
  metadata?: Record<string, any>;
}

export interface ElevationData {
  location: Coordinates;
  elevation: number;
  resolution: number;
}

// ===================================
// Street View
// ===================================

export interface StreetViewData {
  position: Coordinates;
  pov: {
    heading: number;
    pitch: number;
    zoom?: number;
  };
  location?: {
    description: string;
    latLng: Coordinates;
    pano: string;
    shortDescription: string;
  };
}

