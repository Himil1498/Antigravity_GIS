
import type { Building, Obstacle } from '../buildingData/index';
import { isPointInPolygon, haversineDistance } from './geometry';

/**
 * Get surface elevation at a point (terrain + obstacles/buildings)
 *
 * @returns Object with height, type, and name of obstruction
 */
export const getSurfaceElevation = (
  location: { lat: number; lng: number },
  terrainElevation: number,
  buildings: Building[],
  obstacles: Obstacle[]
): { height: number; type: string; name?: string } => {
  let maxHeight = terrainElevation;
  let type = 'terrain';
  let name: string | undefined;

  // Check if point is inside any building polygon
  buildings.forEach(building => {
    if (isPointInPolygon(location, building.coordinates)) {
      const buildingTop = terrainElevation + building.height;
      if (buildingTop > maxHeight) {
        maxHeight = buildingTop;
        type = 'building';
        name = building.name || `${building.type} (${building.height.toFixed(1)}m${building.estimatedHeight ? ' est.' : ''})`;
      }
    }
  });

  // Check proximity to obstacles (trees, towers, poles)
  obstacles.forEach(obstacle => {
    const distance = haversineDistance(location, obstacle.location);
    const effectiveRadius = obstacle.radius || 1;

    if (distance < effectiveRadius) {
      const obstacleTop = terrainElevation + obstacle.height;
      if (obstacleTop > maxHeight) {
        maxHeight = obstacleTop;
        type = obstacle.type;
        name = obstacle.name || `${obstacle.type} (${obstacle.height.toFixed(1)}m${obstacle.estimatedHeight ? ' est.' : ''})`;
      }
    }
  });

  return { height: maxHeight, type, name };
};

