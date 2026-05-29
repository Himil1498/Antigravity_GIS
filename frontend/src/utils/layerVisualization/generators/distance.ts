import type { DataHubEntry } from "../../../types/gisToolTypes/index";
import type { LayerOverlay } from "../types";
import { formatDistance, calculateHaversineDistance } from "../helpers";

/**
 * Create Distance Measurement overlays (polyline + markers + distance labels)
 */
export const createDistanceOverlay = (
  entry: DataHubEntry,
  map: google.maps.Map,
  onViewDetails?: (entry: DataHubEntry) => void,
): LayerOverlay[] => {
  const overlays: LayerOverlay[] = [];
  const data = entry.data as any;

  // Parse points from database JSON column or use existing array
  const rawPoints =
    data.points || (data.points_json ? JSON.parse(data.points_json) : null);

  if (!rawPoints || !Array.isArray(rawPoints)) return overlays;

  // Filter valid points and ensure number type
  const points = rawPoints
    .map((p: any) => {
      const lat = p.lat !== undefined ? p.lat : p.latitude;
      const lng = p.lng !== undefined ? p.lng : p.longitude;
      return {
        ...p,
        lat: Number(lat),
        lng: Number(lng),
      };
    })
    .filter(
      (p: any) =>
        !isNaN(p.lat) && !isNaN(p.lng) && isFinite(p.lat) && isFinite(p.lng),
    );

  if (points.length < 2) return overlays;

  // Create polyline
  const polyline = new google.maps.Polyline({
    path: points,
    geodesic: true,
    strokeColor: data.color || "#3B82F6",
    strokeWeight: 4,
    strokeOpacity: 1.0,
    clickable: true,
    zIndex: 1000,
    map: null,
  });

  // Add click listener to polyline
  if (onViewDetails) {
    polyline.addListener("click", () => {
      onViewDetails(entry);
    });
  }

  overlays.push({
    id: `${entry.id}-line`,
    type: "Distance",
    overlay: polyline,
    entry,
  });

  // Create markers for each point
  points.forEach((point: any, index: number) => {
    const marker = new google.maps.Marker({
      position: { lat: point.lat, lng: point.lng },
      label: {
        text: point.label || String.fromCharCode(65 + index),
        color: "#FFFFFF",
        fontWeight: "bold",
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: data.color || "#3B82F6",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
      map: null,
      title: `${entry.name} - Point ${
        point.label || String.fromCharCode(65 + index)
      }`,
    });

    // Add click listener to marker
    if (onViewDetails) {
      marker.addListener("click", () => {
        onViewDetails(entry);
      });
    }

    overlays.push({
      id: `${entry.id}-marker-${index}`,
      type: "Distance",
      overlay: marker,
      entry,
    });
  });

  // Create distance labels for each segment
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    // Calculate distance between points
    let distance: number;
    try {
      if (google.maps.geometry?.spherical?.computeDistanceBetween) {
        const from = new google.maps.LatLng(p1.lat, p1.lng);
        const to = new google.maps.LatLng(p2.lat, p2.lng);
        distance = google.maps.geometry.spherical.computeDistanceBetween(
          from,
          to,
        );
      } else {
        // Fallback to Haversine formula
        distance = calculateHaversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
      }
    } catch (error) {
      distance = calculateHaversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    }

    // Calculate midpoint
    const midLat = (p1.lat + p2.lat) / 2;
    const midLng = (p1.lng + p2.lng) / 2;

    // Create distance label marker
    const labelMarker = new google.maps.Marker({
      position: { lat: midLat, lng: midLng },
      map: null,
      label: {
        text: formatDistance(distance),
        color: data.color || "#3B82F6",
        fontSize: "14px",
        fontWeight: "bold",
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 0, // Invisible icon, only show label
      },
      clickable: false,
      optimized: false,
      zIndex: 1000001,
    });

    overlays.push({
      id: `${entry.id}-label-${i}`,
      type: "Distance",
      overlay: labelMarker,
      entry,
    });
  }

  return overlays;
};

