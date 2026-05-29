import type { DataHubEntry } from "../../../types/gisToolTypes/index";
import type { LayerOverlay } from "../types";

/**
 * Create Circle overlay
 */
export const createCircleOverlay = (
  entry: DataHubEntry,
  map: google.maps.Map,
  onViewDetails?: (entry: DataHubEntry) => void,
): LayerOverlay | null => {
  const data = entry.data as any;

  // Support both database column format (center_lat, center_lng) and object format (center: {lat, lng})
  let center =
    data.center ||
    (data.center_lat && data.center_lng
      ? {
          lat: Number(data.center_lat),
          lng: Number(data.center_lng),
        }
      : null);

  // Normalize center key names if needed
  if (center && (center.latitude !== undefined || center.lat !== undefined)) {
    const lat = center.lat !== undefined ? center.lat : center.latitude;
    const lng = center.lng !== undefined ? center.lng : center.longitude;
    center = { lat: Number(lat), lng: Number(lng) };
  }

  // Database uses radius_meters, frontend might expect radius
  // FIX: Handle "0" string or 0 number correctly from legacy data
  const radius = Number(data.radius_meters) || Number(data.radius);

  // DEBUG LOGGING
  // DEBUG LOGGING
  // if (entry.id) {
  //   console.log(`[Circle Debug] ID: ${entry.id}`, {
  //       effectiveRadiusMeters: radius,
  //       center: center
  //   });
  // }

  if (!center || !center.lat || !center.lng || !radius) return null;

  const circle = new google.maps.Circle({
    center: center,
    radius: radius,
    strokeColor: data.stroke_color || data.color || "#10B981",
    strokeOpacity: 1.0,
    strokeWeight: data.stroke_weight || data.strokeWeight || 2,
    fillColor: data.fill_color || data.color || "#10B981",
    fillOpacity: Number(data.opacity) || data.fillOpacity || 0.35,
    clickable: true,
    zIndex: 1000,
    map: null,
  });

  // Add click listener to circle
  if (onViewDetails) {
    circle.addListener("click", () => {
      onViewDetails(entry);
    });
  }

  // Create Center Marker to ensure visibility and clickability
  const marker = new google.maps.Marker({
    position: center,
    map: null, // Let parent handle visibility
    title: data.circle_name || "Circle Center",
    zIndex: 101, // Above circle
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 6,
      fillColor: data.stroke_color || data.color || "#10B981",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    },
  });

  // Add click listener to marker
  if (onViewDetails) {
    marker.addListener("click", () => {
      onViewDetails(entry);
    });
  }

  // Return both overlays
  return [
    {
      id: `${entry.id}-circle`,
      type: "Circle",
      overlay: circle,
      entry,
    },
    {
      id: `${entry.id}-marker`,
      type: "Circle",
      overlay: marker,
      entry,
    },
  ] as any; // Cast to any to satisfy current return type signature pending refactor
};

