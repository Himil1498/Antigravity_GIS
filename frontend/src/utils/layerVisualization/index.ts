import type { DataHubEntry } from "../../types/gisToolTypes/index";
import type { LayerOverlay } from "./types";
import { createDistanceOverlay } from "./generators/distance";
import { createPolygonOverlay } from "./generators/polygon";
import { createCircleOverlay } from "./generators/circle";
import { createElevationOverlay } from "./generators/elevation";
import { createSectorRFOverlay } from "./generators/sectorRF";
import { overlayRegistry } from "../overlayRegistry";

export * from "./types";
export * from "./helpers";
export * from "./generators/distance";
export * from "./generators/polygon";
export * from "./generators/circle";
export * from "./generators/elevation";
export * from "./generators/sectorRF";

/**
 * Create map overlays from saved data entries
 * @param entries - Data entries to create overlays from
 * @param map - Google Maps instance
 * @param onViewDetails - Optional callback for viewing details
 * @param useRegistry - Whether to register overlays in the overlay registry (default: true)
 */
export const createOverlaysFromData = (
  entries: DataHubEntry[],
  map: google.maps.Map,
  onViewDetails?: (entry: DataHubEntry) => void,
  useRegistry: boolean = true,
): LayerOverlay[] => {
  const overlays: LayerOverlay[] = [];

  entries.forEach((entry) => {
    try {
      // Check if overlay already exists in registry
      const registryKey = `${entry.type.toLowerCase()}-${entry.id}`;

      if (useRegistry && overlayRegistry.has(registryKey)) {
        // console.log(`⏭️ [createOverlaysFromData] Skipping duplicate overlay: ${registryKey}`);
        return; // Skip creating duplicate
      }

      switch (entry.type) {
        case "Distance":
          const distanceOverlays = createDistanceOverlay(
            entry,
            map,
            onViewDetails,
          );
          overlays.push(...distanceOverlays);
          break;

        case "Polygon":
          const polygonOverlay = createPolygonOverlay(
            entry,
            map,
            onViewDetails,
          );
          if (polygonOverlay) overlays.push(polygonOverlay);
          break;

        case "Circle":
          const circleOverlays = createCircleOverlay(entry, map, onViewDetails);
          if (circleOverlays) {
            if (Array.isArray(circleOverlays)) {
              overlays.push(...circleOverlays);
            } else {
              overlays.push(circleOverlays);
            }
          }
          break;

        case "Elevation":
          const elevationOverlays = createElevationOverlay(
            entry,
            map,
            onViewDetails,
          );
          overlays.push(...elevationOverlays);
          break;

        case "SectorRF":
          const sectorOverlays = createSectorRFOverlay(
            entry,
            map,
            onViewDetails,
          );
          overlays.push(...sectorOverlays);
          break;
      }

      // Register created overlays in the registry
      if (useRegistry) {
        const registryKey = `${entry.type.toLowerCase()}-${entry.id}`;
        overlays.slice(-1).forEach((overlay) => {
          if (overlay.overlay) {
            overlayRegistry.register(registryKey, overlay.overlay, {
              type: entry.type,
              itemId:
                typeof entry.id === "number"
                  ? entry.id
                  : parseInt(String(entry.id), 10),
              source: "layerVisualization",
            });
          }
        });
      }
    } catch (error) {
      console.error(
        `Error creating overlay for ${entry.type} #${entry.id}:`,
        error,
      );
    }
  });

  return overlays;
};

