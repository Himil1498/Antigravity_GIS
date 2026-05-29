
import { createDistanceOverlay } from "./generators/distance";
import { createElevationOverlay } from "./generators/elevation";
import {
  createPolygonOverlay,
  createCircleOverlay,
  createSectorOverlay,
} from "./generators/shapes";
import {
  createInfrastructureOverlay,
  createCustomerOverlay,
} from "./generators/markers";

/**
 * Creates map overlays for different data types from "View on Map" feature
 * @param data - The data object containing overlay information
 * @param type - Type of overlay (distance, elevation, polygon, circle, sector, infrastructure, customer)
 * @param map - Google Maps instance
 * @returns Array of created overlays
 */
export const createViewOnMapOverlays = (
  data: any,
  type: string,
  map: google.maps.Map,
  onClick?: (data: any) => void
): any[] => {
  const overlays: any[] = [];

  switch (type) {
    case "distance":
      createDistanceOverlay(data, map, overlays);
      break;

    case "elevation":
      createElevationOverlay(data, map, overlays);
      break;

    case "polygon":
      createPolygonOverlay(data, map, overlays);
      break;

    case "circle":
      createCircleOverlay(data, map, overlays);
      break;

    case "sector":
      createSectorOverlay(data, map, overlays);
      break;

    case "infrastructure":
      createInfrastructureOverlay(data, map, overlays);
      break;

    case "customer":
      createCustomerOverlay(data, map, overlays);
      break;

    default:
      console.warn(`⚠️ Unknown overlay type: ${type}`);
  }

  return overlays;
};

