import type { DataHubEntry } from "../../../types/gisToolTypes/index";
import type { LayerOverlay } from "../types";

/**
 * Create Sector RF overlay (RF coverage sector)
 */
export const createSectorRFOverlay = (
  entry: DataHubEntry,
  map: google.maps.Map,
  onViewDetails?: (entry: DataHubEntry) => void,
): LayerOverlay[] => {
  const overlays: LayerOverlay[] = [];
  const data = entry.data as any;

  // Support both object format and database column format
  const center =
    data.coordinates ||
    (data.coordinates_json ? JSON.parse(data.coordinates_json) : null) ||
    (data.tower_lat && data.tower_lng
      ? { lat: Number(data.tower_lat), lng: Number(data.tower_lng) }
      : null);
  // Normalize data for consistency
  const azimuth = Number(data.azimuth);
  const beamwidth = Number(data.beamwidth);
  // Handle radius_meters fallback
  const radius = Number(data.radius_meters) || Number(data.radius);

  // Update entry.data with normalized values for ViewOnMapDetails
  entry.data = {
    ...data,
    azimuth,
    beamwidth,
    radius,
    tower_lat: center?.lat,
    tower_lng: center?.lng,
  };

  // Check for null/undefined, not falsy (0 is a valid azimuth!)
  if (
    !center ||
    !Number.isFinite(center.lat) ||
    !Number.isFinite(center.lng) ||
    azimuth == null ||
    isNaN(azimuth)
  ) {
    console.warn(
      "⚠️ SectorRF overlay creation failed - missing required data:",
      {
        id: entry.id,
        hasCenter: !!center,
        lat: center?.lat,
        lng: center?.lng,
        azimuth,
        beamwidth,
        radius,
      },
    );
    return overlays;
  }

  // Calculate sector path
  const sectorPath: google.maps.LatLngLiteral[] = [center];
  const startAngle = azimuth - beamwidth / 2;
  const endAngle = azimuth + beamwidth / 2;

  for (let angle = startAngle; angle <= endAngle; angle += 1) {
    const point = google.maps.geometry.spherical.computeOffset(
      new google.maps.LatLng(center.lat, center.lng),
      radius,
      angle,
    );
    sectorPath.push({ lat: point.lat(), lng: point.lng() });
  }
  sectorPath.push(center);

  const polygon = new google.maps.Polygon({
    paths: sectorPath,
    strokeColor: data.stroke_color || data.color || "#FF6B6B",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    fillColor: data.fill_color || data.color || "#FF6B6B",
    fillOpacity: Number(data.opacity) || 0.35,
    clickable: true,
    zIndex: 1000,
    map: null,
  });

  // Add click listener to polygon
  if (onViewDetails) {
    polygon.addListener("click", () => {
      onViewDetails(entry);
    });
  }

  overlays.push({
    id: `${entry.id}-sector`,
    type: "SectorRF",
    overlay: polygon,
    entry,
  });

  // Add tower marker
  const marker = new google.maps.Marker({
    position: center,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: data.fill_color || data.color || "#FF6B6B",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    },
    title: entry.name,
    map: null,
  });

  // Add click listener to marker
  if (onViewDetails) {
    marker.addListener("click", () => {
      onViewDetails(entry);
    });
  }

  overlays.push({
    id: `${entry.id}-marker`,
    type: "SectorRF",
    overlay: marker,
    entry,
  });

  return overlays;
};

