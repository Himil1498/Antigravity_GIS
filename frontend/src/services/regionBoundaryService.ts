/**
 * Region Boundary Service (Public API)
 * For MapPage - fetches published boundaries for all users
 * Separate from regionService.ts (Admin API)
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:82/api';

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Try multiple token storage keys for compatibility
    const token =
      sessionStorage.getItem('opti_connect_token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('opti_connect_token') ||
      localStorage.getItem('token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔒 Boundary API: Token expired or unauthorized (silent fallback active)');
      // Clear tokens
      sessionStorage.removeItem('opti_connect_token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('opti_connect_token');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

/**
 * Published boundary data structure
 */
export interface PublishedBoundary {
  regionId: number;
  regionName: string;
  regionCode: string;
  regionType: string;
  boundaryGeoJSON: any; // GeoJSON Polygon or MultiPolygon
  boundaryType: string;
  vertexCount: number;
  areaSqKm: number;
  versionNumber: number;
  publishedAt: string;
  publishedBy: number;
}

/**
 * Response from GET /api/boundaries/published
 */
export interface PublishedBoundariesResponse {
  success: boolean;
  count: number;
  boundaries: PublishedBoundary[];
  timestamp: string;
}

/**
 * Fetch all published boundaries for map display
 * Used by MapPage for all users (admin, manager, technician, user)
 */
export const getAllPublishedBoundaries = async (): Promise<PublishedBoundariesResponse> => {
  try {
    console.log('📍 Fetching published boundaries from API...');
    const response = await apiClient.get<PublishedBoundariesResponse>('/boundaries/published');
    console.log(`✅ Received ${response.data.count} published boundaries`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching published boundaries:', error);
    throw error;
  }
};

/**
 * Fallback: Load boundaries from static india.json file
 * Used when API fails or for initial load
 */
export const loadBoundariesFromStaticFile = async (): Promise<PublishedBoundary[]> => {
  try {
    console.log('📥 Loading boundaries from static india.json (fallback)...');
    const response = await fetch('/india.json');

    if (!response.ok) {
      throw new Error('Failed to load india.json');
    }

    const geoJson = await response.json();

    // Transform GeoJSON FeatureCollection to PublishedBoundary format
    const boundaries: PublishedBoundary[] = geoJson.features.map((feature: any, index: number) => ({
      regionId: feature.properties.id || index + 1,
      regionName: feature.properties.st_nm || feature.properties.name || `Region ${index + 1}`,
      regionCode: feature.properties.code || '',
      regionType: feature.properties.type || 'State',
      boundaryGeoJSON: feature.geometry,
      boundaryType: feature.geometry.type,
      vertexCount: countVertices(feature.geometry),
      areaSqKm: 0, // Not available in static file
      versionNumber: feature.properties.version || 1,
      publishedAt: new Date().toISOString(),
      publishedBy: 0, // System
    }));

    console.log(`✅ Loaded ${boundaries.length} boundaries from static file`);
    return boundaries;
  } catch (error: any) {
    console.error('❌ Error loading static boundaries:', error);
    throw error;
  }
};

/**
 * Count vertices in a GeoJSON geometry
 */
function countVertices(geometry: any): number {
  let count = 0;

  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach((ring: number[][]) => {
      count += ring.length;
    });
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((polygon: number[][][]) => {
      polygon.forEach((ring: number[][]) => {
        count += ring.length;
      });
    });
  }

  return count;
}


/**
 * Hybrid approach: Try API first, fallback to static file
 * Recommended for MapPage to ensure reliability
 */
export const loadBoundariesWithFallback = async (): Promise<PublishedBoundary[]> => {
  try {
    // Try API first
    const response = await getAllPublishedBoundaries();

    // If API returns 0 boundaries, use fallback
    if (response.count === 0 || response.boundaries.length === 0) {
      console.warn('⚠️ API returned 0 boundaries, falling back to static file');
      return await loadBoundariesFromStaticFile();
    }

    return response.boundaries;
  } catch (apiError) {
    console.warn('⚠️ API failed, falling back to static file:', apiError);

    try {
      // Fallback to static file
      return await loadBoundariesFromStaticFile();
    } catch (staticError) {
      console.error('❌ Both API and static file failed:', staticError);
      throw new Error('Failed to load boundaries from both API and static file');
    }
  }
};

export default {
  getAllPublishedBoundaries,
  loadBoundariesFromStaticFile,
  loadBoundariesWithFallback,
};

