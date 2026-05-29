
import type { BuildingDataResult, BoundingBox } from './types';
import { CACHE_KEY_PREFIX, CACHE_EXPIRATION_HOURS } from './constants';

/**
 * Generate cache key from bounding box
 */
export const generateCacheKey = (bbox: BoundingBox): string => {
  // Round to 4 decimal places (~11m precision) to improve cache hits
  const key = [
    bbox.south.toFixed(4),
    bbox.north.toFixed(4),
    bbox.west.toFixed(4),
    bbox.east.toFixed(4)
  ].join('_');

  return `${CACHE_KEY_PREFIX}${key}`;
};

/**
 * Get data from localStorage cache
 */
export const getFromCache = (key: string): BuildingDataResult | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const data = JSON.parse(cached);

    // Check if cache is expired
    const expirationTime = new Date(data.timestamp).getTime() + (CACHE_EXPIRATION_HOURS * 60 * 60 * 1000);
    if (Date.now() > expirationTime) {
      localStorage.removeItem(key);
      return null;
    }

    return data.result;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
};

/**
 * Save data to localStorage cache
 */
export const saveToCache = (key: string, result: BuildingDataResult): void => {
  try {
    const cacheData = {
      timestamp: new Date().toISOString(),
      result
    };

    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Cache write error (possibly quota exceeded):', error);
    // If quota exceeded, try to clear old caches
    clearOldCaches();
  }
};

/**
 * Clear old caches from localStorage
 */
const clearOldCaches = (): void => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_KEY_PREFIX));

    // Sort by timestamp and remove oldest 50%
    const cacheData = cacheKeys
      .map(key => ({
        key,
        timestamp: JSON.parse(localStorage.getItem(key) || '{}').timestamp
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const toRemove = cacheData.slice(0, Math.floor(cacheData.length / 2));
    toRemove.forEach(item => localStorage.removeItem(item.key));

  } catch (error) {
    console.warn('Error clearing old caches:', error);
  }
};

/**
 * Clear all building data caches
 */
export const clearAllBuildingCaches = (): void => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_KEY_PREFIX));
    cacheKeys.forEach(key => localStorage.removeItem(key));
    
  } catch (error) {
    console.warn('Error clearing caches:', error);
  }
};

