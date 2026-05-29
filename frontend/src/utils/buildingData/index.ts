
import type { BuildingDataResult } from './types';
import { calculateBoundingBox, calculateCoverage } from './helpers';
import { generateCacheKey, getFromCache, saveToCache } from './caching';
import { fetchBuildingsFromOSM, fetchObstaclesFromOSM } from './osmService';

export * from './types';
export * from './constants';
export * from './helpers';
export * from './caching';
export * from './parsers';
export * from './osmService';

/**
 * Fetch buildings and obstacles along a path
 * @param path Array of lat/lng points defining the path
 * @param bufferMeters Buffer distance around path in meters (default: 100m)
 * @returns Building and obstacle data with coverage metrics
 */
export const fetchBuildingsAlongPath = async (
  path: Array<{ lat: number; lng: number }>,
  bufferMeters: number = 50 // Reduced from 100m to 50m for more accurate results
): Promise<BuildingDataResult> => {
  try {
    // Calculate bounding box around path
    const bbox = calculateBoundingBox(path, bufferMeters);

    // Check cache first
    const cacheKey = generateCacheKey(bbox);
    const cachedData = getFromCache(cacheKey);

    if (cachedData) {
      
      return {
        ...cachedData,
        cached: true,
        dataSource: 'Cache'
      };
    }

    // Fetch from Overpass API
    
    const buildings = await fetchBuildingsFromOSM(bbox);
    const obstacles = await fetchObstaclesFromOSM(bbox);

    // Calculate coverage statistics
    const coverage = calculateCoverage(buildings);

    const result: BuildingDataResult = {
      buildings,
      obstacles,
      coverage,
      cached: false,
      dataSource: 'OSM'
    };

    // Save to cache
    saveToCache(cacheKey, result);

    return result;

  } catch (error) {
    console.error('Error fetching building data:', error);
    throw new Error('Failed to fetch building data. Please try again.');
  }
};

