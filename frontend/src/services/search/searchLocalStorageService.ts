
import type { SearchResult, SearchType, SearchSource } from './types';

/**
 * Fallback: Search localStorage (original implementation)
 */
export const searchSavedDataLocalStorage = (query: string): SearchResult[] => {
  try {
    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search Distance Measurements
    const distances = JSON.parse(
      localStorage.getItem("gis_distance_measurements") || "[]"
    );
    distances.forEach((item: any) => {
      if (item.name?.toLowerCase().includes(queryLower)) {
        const points = item.points || [];
        const location = points.length > 0 ? points[0] : { lat: 0, lng: 0 };
        results.push({
          id: item.id,
          name: item.name,
          type: "savedData" as SearchType,
          location,
          address: `Distance: ${item.totalDistance || 0}m`,
          data: {
            ...item,
            type: "Distance",
            // 🆕 Include elevation data from localStorage
            elevation_data: item.elevation_data || item.elevationData,
            max_elevation: item.max_elevation || item.maxElevation,
            min_elevation: item.min_elevation || item.minElevation,
            elevation_gain: item.elevation_gain || item.elevationGain,
            elevation_loss: item.elevation_loss || item.elevationLoss
          },
          source: "saved" as SearchSource
        });
      }
    });

    // Search Polygons
    const polygons = JSON.parse(localStorage.getItem("gis_polygons") || "[]");
    polygons.forEach((item: any) => {
      if (item.name?.toLowerCase().includes(queryLower)) {
        const vertices = item.vertices || item.path || [];
        let location = { lat: 0, lng: 0 };
        if (vertices.length > 0) {
          let latSum = 0,
            lngSum = 0;
          vertices.forEach((v: any) => {
            latSum += v.lat;
            lngSum += v.lng;
          });
          location = {
            lat: latSum / vertices.length,
            lng: lngSum / vertices.length
          };
        }
        results.push({
          id: item.id,
          name: item.name,
          type: "savedData" as SearchType,
          location,
          address: `Polygon: ${item.area || 0}m²`,
          data: { ...item, type: "Polygon" },
          source: "saved" as SearchSource
        });
      }
    });

    // Search Circles
    const circles = JSON.parse(localStorage.getItem("gis_circles") || "[]");
    circles.forEach((item: any) => {
      if (item.name?.toLowerCase().includes(queryLower)) {
        const location = item.center || { lat: 0, lng: 0 };
        results.push({
          id: item.id,
          name: item.name,
          type: "savedData" as SearchType,
          location,
          address: `Circle: ${item.radius || 0}m radius`,
          data: { ...item, type: "Circle" },
          source: "saved" as SearchSource
        });
      }
    });

    // Search Elevation Profiles
    const elevations = JSON.parse(
      localStorage.getItem("gis_elevation_profiles") || "[]"
    );
    elevations.forEach((item: any) => {
      if (item.name?.toLowerCase().includes(queryLower)) {
        const points = item.points || [];
        const location = points.length > 0 ? points[0] : { lat: 0, lng: 0 };
        results.push({
          id: item.id,
          name: item.name,
          type: "savedData" as SearchType,
          location,
          address: `Elevation Profile`,
          data: { ...item, type: "Elevation" },
          source: "saved" as SearchSource
        });
      }
    });

    // Search Infrastructure
    const infrastructures = JSON.parse(
      localStorage.getItem("gis_infrastructures") || "[]"
    );
    infrastructures.forEach((item: any) => {
      if (
        item.name?.toLowerCase().includes(queryLower) ||
        item.notes?.toLowerCase().includes(queryLower)
      ) {
        const location = item.coordinates ||
          item.location || { lat: 0, lng: 0 };

        let addressStr = "";
        if (item.address && typeof item.address === "object") {
          const addr = item.address;
          addressStr = [addr.street, addr.city, addr.state, addr.pincode]
            .filter(Boolean)
            .join(", ");
        } else {
          addressStr = item.address || item.notes || "";
        }

        results.push({
          id: item.id,
          name: item.name,
          type: "savedData" as SearchType,
          location,
          address: addressStr,
          data: { ...item, type: "Infrastructure" },
          source: "saved" as SearchSource
        });
      }
    });

    return results;
  } catch (error) {
    console.error("Error searching localStorage:", error);
    return [];
  }
};

