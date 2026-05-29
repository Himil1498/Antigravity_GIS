
import axios from 'axios';
import type { Building, Obstacle, BoundingBox, OSMResponse } from './types';
import { OVERPASS_API_URL } from './constants';
import { parseOSMBuildings, parseOSMObstacles } from './parsers';

/**
 * Fetch buildings from OpenStreetMap via Overpass API
 */
export const fetchBuildingsFromOSM = async (bbox: BoundingBox): Promise<Building[]> => {
  // Optimized query - only fetch buildings, simplified output
  const query = `
    [out:json][timeout:15];
    (
      way["building"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
    );
    out geom;
  `;

  try {
    const response = await axios.post<OSMResponse>(OVERPASS_API_URL, query, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 20000 // 20 second timeout
    });

    return parseOSMBuildings(response.data.elements);
  } catch (error: any) {
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a few moments.');
    }
    if (error.response?.status === 504 || error.code === 'ECONNABORTED') {
      console.warn('OSM API timeout - returning empty building list');
      return []; // Return empty array instead of throwing error
    }
    console.error('OSM building fetch error:', error);
    return []; // Return empty array for other errors too
  }
};

/**
 * Fetch obstacles (trees, towers, poles) from OpenStreetMap
 */
export const fetchObstaclesFromOSM = async (bbox: BoundingBox): Promise<Obstacle[]> => {
  const query = `
    [out:json][timeout:25];
    (
      node["natural"="tree"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["natural"="tree_row"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      node["man_made"="mast"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      node["man_made"="tower"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      node["power"="tower"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      node["power"="pole"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      node["man_made"="chimney"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
    );
    out body;
  `;

  try {
    const response = await axios.post<OSMResponse>(OVERPASS_API_URL, query, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 30000
    });

    return parseOSMObstacles(response.data.elements);
  } catch (error) {
    console.warn('Failed to fetch obstacles, continuing without them:', error);
    return []; // Non-critical, return empty array
  }
};

