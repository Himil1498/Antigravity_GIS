import type { DataHubEntry } from "../../../types/gisToolTypes/index";
import type { LayerOverlay } from "../types";

/**
 * Create Elevation Profile overlays (polyline + markers)
 */
export const createElevationOverlay = (
  entry: DataHubEntry,
  map: google.maps.Map,
  onViewDetails?: (entry: DataHubEntry) => void,
): LayerOverlay[] => {
  const overlays: LayerOverlay[] = [];
  const data = entry.data as any;

  // Parse points from database JSON column or use existing array, or use start/end points
  // Parse points from database JSON column (path_coordinates or points) or use existing array
  // The database stores coordinates in 'path_coordinates' column
  const points =
    data.points ||
    data.path_coordinates ||
    (data.points_json ? JSON.parse(data.points_json) : null) ||
    (data.start_point && data.end_point
      ? [data.start_point, data.end_point]
      : null);
  if (!points || points.length < 2) return overlays;

  // Create polyline
  const polyline = new google.maps.Polyline({
    path: points,
    geodesic: true,
    strokeColor: "#F59E0B",
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
    type: "Elevation",
    overlay: polyline,
    entry,
  });

  // Start point marker
  const startMarker = new google.maps.Marker({
    position: points[0],
    map: null,
    label: { text: "A", color: "white", fontWeight: "bold" },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: "#10B981",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
    },
    title: "Start Point",
    zIndex: 101,
  });

  if (onViewDetails) {
    startMarker.addListener("click", () => {
      onViewDetails(entry);
    });
  }

  overlays.push({
    id: `${entry.id}-start`,
    type: "Elevation",
    overlay: startMarker,
    entry,
  });

  // End point marker
  const endMarker = new google.maps.Marker({
    position: points[points.length - 1],
    map: null,
    label: { text: "B", color: "white", fontWeight: "bold" },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: "#EF4444",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
    },
    title: "End Point",
    zIndex: 101,
  });

  if (onViewDetails) {
    endMarker.addListener("click", () => {
      onViewDetails(entry);
    });
  }

  overlays.push({
    id: `${entry.id}-end`,
    type: "Elevation",
    overlay: endMarker,
    entry,
  });

  // 🔥 Add bearing arcs and labels for 2-point profiles
  if (
    points.length === 2 &&
    data.bearing !== null &&
    data.bearing !== undefined
  ) {
    const pointA = new google.maps.LatLng(points[0].lat, points[0].lng);
    const pointB = new google.maps.LatLng(points[1].lat, points[1].lng);
    const bearing = Number(data.bearing);
    const reverseBearing =
      data.reverse_bearing !== null && data.reverse_bearing !== undefined
        ? Number(data.reverse_bearing)
        : (bearing + 180) % 360;

    const totalDist = google.maps.geometry.spherical.computeDistanceBetween(
      pointA,
      pointB,
    );
    const arcRadius = Math.min(totalDist * 0.12, 500);

    // Helper: Draw bearing arc
    const drawBearingArc = (
      center: google.maps.LatLng,
      bearingAngle: number,
      color: string,
      suffix: string,
    ) => {
      const arcPoints: google.maps.LatLng[] = [];
      for (let angle = 0; angle <= bearingAngle; angle += 2) {
        const point = google.maps.geometry.spherical.computeOffset(
          center,
          arcRadius,
          angle,
        );
        arcPoints.push(point);
      }
      const arc = new google.maps.Polyline({
        path: arcPoints,
        geodesic: false,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: null,
        zIndex: 99,
      });
      overlays.push({
        id: `${entry.id}-bearing-arc-${suffix}`,
        type: "Elevation",
        overlay: arc,
        entry,
      });
    };

    // Helper: Draw north reference line
    const drawNorthLine = (center: google.maps.LatLng, suffix: string) => {
      const northEnd = google.maps.geometry.spherical.computeOffset(
        center,
        arcRadius,
        0,
      );
      const northLine = new google.maps.Polyline({
        path: [center, northEnd],
        geodesic: false,
        strokeColor: "#6B7280",
        strokeOpacity: 0.6,
        strokeWeight: 2,
        map: null,
        zIndex: 98,
      });
      overlays.push({
        id: `${entry.id}-north-line-${suffix}`,
        type: "Elevation",
        overlay: northLine,
        entry,
      });
    };

    // Draw arcs and north lines
    drawNorthLine(pointA, "A");
    drawNorthLine(pointB, "B");
    drawBearingArc(pointA, bearing, "#047857", "A");
    drawBearingArc(pointB, reverseBearing, "#B91C1C", "B");

    // Add degree labels using invisible markers
    const labelPosA = google.maps.geometry.spherical.computeOffset(
      pointA,
      arcRadius * 0.6,
      bearing / 2,
    );
    const labelPosB = google.maps.geometry.spherical.computeOffset(
      pointB,
      arcRadius * 0.6,
      reverseBearing / 2,
    );

    const labelA = new google.maps.Marker({
      position: labelPosA,
      map: null,
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
      label: {
        text: `${bearing.toFixed(1)}°`,
        color: "#047857",
        fontSize: "18px",
        fontWeight: "900",
      },
      zIndex: 102,
    });
    overlays.push({
      id: `${entry.id}-bearing-label-A`,
      type: "Elevation",
      overlay: labelA,
      entry,
    });

    const labelB = new google.maps.Marker({
      position: labelPosB,
      map: null,
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
      label: {
        text: `${reverseBearing.toFixed(1)}°`,
        color: "#B91C1C",
        fontSize: "18px",
        fontWeight: "900",
      },
      zIndex: 102,
    });
    overlays.push({
      id: `${entry.id}-bearing-label-B`,
      type: "Elevation",
      overlay: labelB,
      entry,
    });
  }

  return overlays;
};

