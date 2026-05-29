
import type { Building, Obstacle, OSMElement } from './types';
import { DEFAULT_BUILDING_HEIGHTS } from './constants';

/**
 * Parse height string to number (handles various formats)
 */
export const parseHeight = (heightStr: string | number | undefined): number => {
  if (typeof heightStr === 'number') return heightStr;
  if (!heightStr) return 0;

  const str = String(heightStr).toLowerCase().trim();

  // Remove common units and parse
  const numStr = str.replace(/[^\d.]/g, '');
  const value = parseFloat(numStr);

  if (isNaN(value)) return 0;

  // Convert feet to meters if indicated
  if (str.includes('ft') || str.includes('feet') || str.includes("'")) {
    return value * 0.3048;
  }

  return value;
};

/**
 * Estimate building height based on type
 */
export const estimateBuildingHeight = (buildingType: string): { height: number; confidence: number } => {
  const type = buildingType.toLowerCase();
  return DEFAULT_BUILDING_HEIGHTS[type] || { height: 10, confidence: 50 };
};

/**
 * Parse OSM data into Building objects
 */
export const parseOSMBuildings = (elements: OSMElement[]): Building[] => {
  const nodes = new Map<number, { lat: number; lng: number }>();
  const buildings: Building[] = [];

  // First pass: collect all nodes
  elements.forEach(el => {
    if (el.type === 'node' && el.lat !== undefined && el.lon !== undefined) {
      nodes.set(el.id, { lat: el.lat, lng: el.lon });
    }
  });

  // Second pass: construct buildings
  elements.forEach(el => {
    if ((el.type === 'way' || el.type === 'relation') && el.tags && el.tags.building) {
      // Use geometry if available (from 'out geom;'), otherwise use nodes
      let coordinates: Array<{ lat: number; lng: number }> = [];

      if (el.geometry && el.geometry.length > 0) {
        // Direct geometry from 'out geom;' - already has lat/lon
        coordinates = el.geometry.map(g => ({ lat: g.lat, lng: g.lon }));
      } else if (el.nodes) {
        // Traditional node reference - need to look up coordinates
        coordinates = (el.nodes
          .map((nodeId: number) => nodes.get(nodeId))
          .filter((coord): coord is { lat: number; lng: number } => coord !== undefined) || []);
      }

      if (coordinates.length < 3) return; // Need at least 3 points for a polygon

      let height = 0;
      let estimatedHeight = false;
      let confidence = 100;

      // Try to get height from tags
      if (el.tags.height) {
        height = parseHeight(el.tags.height);
        estimatedHeight = false;
        confidence = 100;
      } else if (el.tags['building:height']) {
        height = parseHeight(el.tags['building:height']);
        estimatedHeight = false;
        confidence = 100;
      } else if (el.tags['building:levels']) {
        // Estimate from number of levels
        const levels = parseInt(el.tags['building:levels']);
        height = levels * 3.5; // Average 3.5m per floor
        estimatedHeight = true;
        confidence = 85;
      } else {
        // Estimate based on building type
        const estimation = estimateBuildingHeight(el.tags.building);
        height = estimation.height;
        estimatedHeight = true;
        confidence = estimation.confidence;
      }

      buildings.push({
        id: `osm-${el.type}-${el.id}`,
        osmId: el.id,
        coordinates,
        height,
        estimatedHeight,
        confidence,
        levels: el.tags['building:levels'] ? parseInt(el.tags['building:levels']) : undefined,
        type: el.tags.building,
        name: el.tags.name,
        roofHeight: el.tags['roof:height'] ? parseHeight(el.tags['roof:height']) : undefined
      });
    }
  });

  return buildings;
};

/**
 * Parse OSM data into Obstacle objects
 */
export const parseOSMObstacles = (elements: OSMElement[]): Obstacle[] => {
  return elements
    .filter((el): el is OSMElement & { lat: number; lon: number } =>
      el.type === 'node' && el.lat !== undefined && el.lon !== undefined
    )
    .map(el => {
      let type: Obstacle['type'] = 'tree';
      let height = 10;
      let estimatedHeight = true;
      let confidence = 60;
      let radius = 5;

      if (el.tags) {
        // Determine obstacle type and height
        if (el.tags.natural === 'tree') {
          type = 'tree';
          height = parseHeight(el.tags.height || el.tags.est_height) || 15;
          estimatedHeight = !el.tags.height;
          confidence = el.tags.height ? 95 : 60;
          radius = parseFloat(el.tags.diameter_crown) || 5;
        } else if (el.tags.man_made === 'tower' || el.tags.man_made === 'mast') {
          type = el.tags.man_made === 'mast' ? 'mast' : 'tower';
          height = parseHeight(el.tags.height) || 30;
          estimatedHeight = !el.tags.height;
          confidence = el.tags.height ? 100 : 50;
          radius = 2;
        } else if (el.tags.power === 'tower') {
          type = 'tower';
          height = parseHeight(el.tags.height) || 25;
          estimatedHeight = !el.tags.height;
          confidence = el.tags.height ? 100 : 60;
          radius = 2;
        } else if (el.tags.power === 'pole') {
          type = 'pole';
          height = parseHeight(el.tags.height) || 12;
          estimatedHeight = !el.tags.height;
          confidence = el.tags.height ? 100 : 70;
          radius = 0.5;
        } else if (el.tags.man_made === 'chimney') {
          type = 'chimney';
          height = parseHeight(el.tags.height) || 20;
          estimatedHeight = !el.tags.height;
          confidence = el.tags.height ? 100 : 50;
          radius = 1;
        }
      }

      return {
        id: `osm-obstacle-${el.id}`,
        type,
        location: { lat: el.lat, lng: el.lon },
        height,
        estimatedHeight,
        confidence,
        radius,
        name: el.tags?.name
      };
    });
};

