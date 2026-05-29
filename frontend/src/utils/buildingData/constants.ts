
export const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
export const CACHE_EXPIRATION_HOURS = 24;
export const CACHE_KEY_PREFIX = 'building_cache_';

// Default heights by building type (meters)
export const DEFAULT_BUILDING_HEIGHTS: Record<string, { height: number; confidence: number }> = {
  'house': { height: 6, confidence: 80 },
  'residential': { height: 10, confidence: 75 },
  'apartments': { height: 15, confidence: 70 },
  'detached': { height: 8, confidence: 80 },
  'terrace': { height: 7, confidence: 80 },
  'commercial': { height: 12, confidence: 70 },
  'retail': { height: 8, confidence: 75 },
  'industrial': { height: 10, confidence: 65 },
  'warehouse': { height: 8, confidence: 70 },
  'office': { height: 20, confidence: 65 },
  'hotel': { height: 25, confidence: 60 },
  'hospital': { height: 15, confidence: 70 },
  'school': { height: 12, confidence: 75 },
  'university': { height: 15, confidence: 70 },
  'public': { height: 10, confidence: 70 },
  'church': { height: 18, confidence: 65 },
  'mosque': { height: 15, confidence: 70 },
  'temple': { height: 12, confidence: 70 },
  'garage': { height: 3, confidence: 85 },
  'shed': { height: 4, confidence: 85 },
  'roof': { height: 3, confidence: 80 },
  'barn': { height: 8, confidence: 75 },
  'yes': { height: 8, confidence: 50 }, // Generic building
};

