
import { DataEntry } from "./types";
import { createInfrastructureOverlay } from "./overlays/infrastructure";
import { createCircleOverlay, createPolygonOverlay } from "./overlays/shapes";
import { createDistanceOverlay } from "./overlays/distance";
import { createElevationOverlay } from "./overlays/elevation";
import { createBookmarkOverlay } from "./overlays/bookmarks";

export * from "./types";
export * from "./helpers";
export * from "./modals";

/**
 * Create map overlays and info windows for a data entry
 * Returns array of overlays that can be removed later
 */
export function createVisualizationForEntry(
  entry: DataEntry,
  map: google.maps.Map
): google.maps.MVCObject[] {
  const overlays: google.maps.MVCObject[] = [];

  switch (entry.type) {
    case "Infrastructure":
      createInfrastructureOverlay(entry, map, overlays);
      break;

    case "Circle":
      createCircleOverlay(entry, map, overlays);
      break;

    case "Polygon":
      createPolygonOverlay(entry, map, overlays);
      break;

    case "Distance":
      createDistanceOverlay(entry, map, overlays);
      break;

    case "Elevation":
      createElevationOverlay(entry, map, overlays);
      break;

    case "Bookmark":
      createBookmarkOverlay(entry, map, overlays);
      break;
  }

  return overlays;
}

