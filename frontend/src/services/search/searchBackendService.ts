
import * as apiService from '../api/index';
import type { SearchResult } from './types';
import {
  parseInfrastructure,
  parseDistanceMeasurement,
  parsePolygon,
  parseCircle,
  parseElevationProfile,
  parseSector
} from './searchParsers';
import { searchSavedDataLocalStorage } from './searchLocalStorageService';

/**
 * Search through saved GIS data - WITH BACKEND INTEGRATION
 */
export const searchSavedDataBackend = async (query: string, userId?: number): Promise<SearchResult[]> => {
  try {
    // Call the backend API with optional userId
    const response = await apiService.searchSavedData(query, userId);

    if (!response || !response.results) {
      console.warn("⚠️ No results from backend");
      return [];
    }

    const results: SearchResult[] = [];

    // Process Infrastructure
    if (response.results.infrastructure && Array.isArray(response.results.infrastructure)) {
      response.results.infrastructure.forEach((item: any) => {
        const parsed = parseInfrastructure(item);
        if (parsed) results.push(parsed);
      });
    }

    // Process Distance Measurements
    if (response.results.measurements && Array.isArray(response.results.measurements)) {
      response.results.measurements.forEach((item: any) => {
        const parsed = parseDistanceMeasurement(item);
        if (parsed) results.push(parsed);
      });
    }

    // Process Polygons
    if (response.results.polygons && Array.isArray(response.results.polygons)) {
      response.results.polygons.forEach((item: any) => {
        const parsed = parsePolygon(item);
        if (parsed) results.push(parsed);
      });
    }

    // Process Circles
    if (response.results.circles && Array.isArray(response.results.circles)) {
      response.results.circles.forEach((item: any) => {
        const parsed = parseCircle(item);
        if (parsed) results.push(parsed);
      });
    }

    // Process Elevation Profiles
    if (response.results.elevations && Array.isArray(response.results.elevations)) {
      response.results.elevations.forEach((item: any) => {
        const parsed = parseElevationProfile(item);
        if (parsed) results.push(parsed);
      });
    }

    // Process Sectors
    if (response.results.sectors && Array.isArray(response.results.sectors)) {
      response.results.sectors.forEach((item: any) => {
        const parsed = parseSector(item);
        if (parsed) results.push(parsed);
      });
    }

    return results;
  } catch (error) {
    console.error("❌ Error searching saved data from backend:", error);

    // FALLBACK: Try localStorage as backup
    return searchSavedDataLocalStorage(query);
  }
};

