import type { DataHubEntry } from "../../../types/gisToolTypes/index";
import type { LayerOverlay } from "../types";

/**
 * Create Polygon overlay
 */
export const createPolygonOverlay = (
  entry: DataHubEntry,
  map: google.maps.Map,
  onViewDetails?: (entry: DataHubEntry) => void,
): LayerOverlay | null => {
  const data = entry.data as any;

  // Parse coordinates from database JSON column or use existing array
  const rawCoordinates =
    data.coordinates ||
    (data.vertices_json ? JSON.parse(data.vertices_json) : null) ||
    data.vertices;

  if (
    !rawCoordinates ||
    !Array.isArray(rawCoordinates) ||
    rawCoordinates.length < 3
  )
    return null;

  // Normalize coordinates
  const coordinates = rawCoordinates
    .map((p: any) => {
      const lat = p.lat !== undefined ? p.lat : p.latitude;
      const lng = p.lng !== undefined ? p.lng : p.longitude;
      return { lat: Number(lat), lng: Number(lng) };
    })
    .filter((p: any) => !isNaN(p.lat) && !isNaN(p.lng));

  const polygon = new google.maps.Polygon({
    paths: coordinates,
    strokeColor: data.stroke_color || data.color || "#8B5CF6",
    strokeOpacity: 1.0,
    strokeWeight: data.stroke_weight || data.strokeWeight || 2,
    fillColor: data.fill_color || data.color || "#8B5CF6",
    fillOpacity: data.opacity || data.fillOpacity || 0.35,
    clickable: true,
    zIndex: 1000,
    map: null,
  });

  // Add click listener
  if (onViewDetails) {
    polygon.addListener("click", () => {
      onViewDetails(entry);
    });
  }

  return {
    id: entry.id,
    type: "Polygon",
    overlay: polygon,
    entry,
  };
};

