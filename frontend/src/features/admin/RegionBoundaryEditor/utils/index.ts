import { GeoJSONGeometry } from "../types/index";

// Calculate center of boundary for map positioning
export const calculateBoundaryCenter = (
  geojson: GeoJSONGeometry | null | undefined
): { lat: number; lng: number } => {
  if (!geojson || !geojson.coordinates) {
      return { lat: 20.5937, lng: 78.9629 };
  }

  let allCoords: number[][] = [];

  if (geojson.type === "Polygon") {
    allCoords = geojson.coordinates[0] as number[][];
  } else if (geojson.type === "MultiPolygon") {
    geojson.coordinates.forEach((polygon) => {
      allCoords = allCoords.concat(polygon[0] as number[][]);
    });
  }

  if (allCoords.length === 0) return { lat: 20.5937, lng: 78.9629 };

  const lats = allCoords.map((c) => c[1]);
  const lngs = allCoords.map((c) => c[0]);

  return {
    lat: (Math.max(...lats) + Math.min(...lats)) / 2,
    lng: (Math.max(...lngs) + Math.min(...lngs)) / 2,
  };
};

// Convert GeoJSON coordinates to Google Maps LatLng paths
export const geojsonToGooglePaths = (
  geojson: GeoJSONGeometry
): google.maps.LatLng[][][] => {
  const paths: google.maps.LatLng[][][] = [];

  if (!geojson || !geojson.coordinates) return paths;

  if (geojson.type === "Polygon") {
    const polygon: google.maps.LatLng[][] = geojson.coordinates.map((ring) =>
      (ring as number[][]).map(
        (coord) => new google.maps.LatLng(coord[1], coord[0])
      )
    );
    paths.push(polygon);
  } else if (geojson.type === "MultiPolygon") {
    geojson.coordinates.forEach((polygonCoords) => {
      const polygon: google.maps.LatLng[][] = polygonCoords.map((ring) =>
        (ring as number[][]).map(
          (coord) => new google.maps.LatLng(coord[1], coord[0])
        )
      );
      paths.push(polygon);
    });
  }

  return paths;
};

// Convert Google Maps paths back to GeoJSON
export const googlePathsToGeoJSON = (
  paths: google.maps.LatLng[][][]
): GeoJSONGeometry => {
  // Helper to ensure ring is closed
  const ensureClosed = (ring: google.maps.LatLng[]) => {
    if (ring.length === 0) return [];
    const coords = ring.map((latLng) => [latLng.lng(), latLng.lat()]);
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coords.push([first[0], first[1]]);
    }
    return coords;
  };

  if (paths.length === 1) {
    // Single Polygon
    const coordinates = paths[0].map(ensureClosed);
    return {
      type: "Polygon",
      coordinates: coordinates,
    };
  } else {
    // MultiPolygon
    const coordinates = paths.map((polygon) => polygon.map(ensureClosed));
    return {
      type: "MultiPolygon",
      coordinates: coordinates,
    };
  }
};

