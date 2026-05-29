
import type { Coordinates } from '../common/index';

// ===================================
// Core Map Types
// ===================================

export interface MapInstance {
  instance: google.maps.Map | null;
  isLoaded: boolean;
  loadError: string | null;
}

export interface MapViewport {
  center: Coordinates;
  zoom: number;
  bounds?: google.maps.LatLngBounds;
  heading?: number;
  tilt?: number;
}

export interface MapConfiguration {
  apiKey: string;
  libraries: string[];
  region: string;
  language: string;
  version: string;
  mapId?: string;
}

export interface CustomMapControl {
  id: string;
  name: string;
  position: google.maps.ControlPosition;
  content: React.ReactNode;
  visible: boolean;
  onClick?: () => void;
}

export interface MapOptions extends google.maps.MapOptions {
  // Extended options specific to our application
  enableGeofencing?: boolean;
  restrictToIndia?: boolean;
  customControls?: CustomMapControl[];
  performanceMode?: 'standard' | 'optimized' | 'high_performance';
}

export interface MapControlState {
  zoomControlVisible: boolean;
  mapTypeControlVisible: boolean;
  scaleControlVisible: boolean;
  streetViewControlVisible: boolean;
  fullscreenControlVisible: boolean;
  customControls: CustomMapControl[];
}

// ===================================
// Performance and Optimization
// ===================================

export interface MapPerformanceConfig {
  enableClustering: boolean;
  maxMarkersBeforeClustering: number;
  tileLoadingStrategy: 'eager' | 'lazy' | 'progressive';
  markerOptimization: boolean;
  animationDuration: number;
  debounceTime: number;
  memoryManagement: {
    enableAutoCleanup: boolean;
    maxCacheSize: number;
    cleanupInterval: number;
  };
}

export interface MapStats {
  markersCount: number;
  layersCount: number;
  visibleMarkersCount: number;
  activeLayers: string[];
  renderTime: number;
  memoryUsage: number;
  apiCalls: number;
  lastUpdate: string;
}

