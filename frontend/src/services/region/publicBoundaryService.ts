/**
 * Region Boundary Service (Public API)
 * For MapPage - fetches published boundaries for all users
 * Separate from regionService.ts (Admin API)
 * // RESTORED FIX
 */

import axios from "axios";
import {
  deduplicateApiBoundaries,
  mergeBoundaries,
  countVertices,
} from "./boundaryMergeUtils";
import { getAllRegions } from "./regionCoreService";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:82/api";

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("opti_connect_token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("opti_connect_token") ||
      localStorage.getItem("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 errors (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔒 Boundary API: Token expired or unauthorized (silent fallback active)");
      sessionStorage.removeItem("opti_connect_token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("opti_connect_token");
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  },
);

/**
 * Published boundary data structure
 */
export interface PublishedBoundary {
  regionId: number;
  regionName: string;
  regionCode: string;
  regionType: string;
  boundaryGeoJSON: any;
  boundaryType: string;
  vertexCount: number;
  areaSqKm: number;
  versionNumber: number;
  publishedAt: string;
  publishedBy: number;
}

/**
 * Response from GET /api/boundaries/published
 */
export interface PublishedBoundariesResponse {
  success: boolean;
  count: number;
  boundaries: PublishedBoundary[];
  timestamp: string;
}

/**
 * Fetch all published boundaries for map display
 */
export const getAllPublishedBoundaries =
  async (): Promise<PublishedBoundariesResponse> => {
    try {
      // console.log('📍 Fetching published boundaries from API...');
      const response = await apiClient.get<PublishedBoundariesResponse>(
        "/boundaries/published",
        {
          params: { _t: Date.now() }, // Cache busting
        },
      );
      // console.log(`✅ Received ${response.data.count} published boundaries`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching published boundaries:", error);
      throw error;
    }
  };

/**
 * Fallback: Load boundaries from static india.json file
 */
export const loadBoundariesFromStaticFile = async (): Promise<
  PublishedBoundary[]
> => {
  try {
    // console.log('📥 Loading boundaries from static india.json (fallback)...');
    const response = await fetch("/india.json");

    if (!response.ok) throw new Error("Failed to load india.json");

    const geoJson = await response.json();

    // Fix for "Dadra and Nagar Haveli and Daman and Diu"
    // 1. Find the separate features
    const dnhIndex = geoJson.features.findIndex((f: any) => {
      const name = (f.properties?.st_nm || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      return name === "dadraandnagarhaveli";
    });

    const ddIndex = geoJson.features.findIndex((f: any) => {
      const name = (f.properties?.st_nm || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      return name === "damananddiu";
    });

    if (dnhIndex !== -1 && ddIndex !== -1) {
      const dnh = geoJson.features[dnhIndex];
      const dd = geoJson.features[ddIndex];

      // 2. Prepare Coordinates
      const dnhCoords =
        dnh.geometry.type === "Polygon"
          ? [dnh.geometry.coordinates]
          : dnh.geometry.coordinates;
      const ddCoords =
        dd.geometry.type === "Polygon"
          ? [dd.geometry.coordinates]
          : dd.geometry.coordinates;

      // 3. Define Diu Manual Polygon (Missing in india.json)
      const DIU_COORDINATES = [
        [70.9, 20.71],
        [70.99, 20.71],
        [71.02, 20.713],
        [71.02, 20.73],
        [70.99, 20.73],
        [70.9, 20.73],
        [70.9, 20.71],
      ];

      // 4. Create Merged Feature
      const mergedFeature = {
        type: "Feature",
        properties: {
          ...dnh.properties,
          st_nm: "Dadra and Nagar Haveli and Daman and Diu",
          name: "Dadra and Nagar Haveli and Daman and Diu",
        },
        geometry: {
          type: "MultiPolygon",
          coordinates: [...dnhCoords, ...ddCoords, [DIU_COORDINATES]],
        },
      };

      // 5. Replace in array (Remove both, add merged)
      // We set ID of merged to one of them, or let it be assigned by index later
      // Remove higher index first to keep lower index stable
      const maxIndex = Math.max(dnhIndex, ddIndex);
      const minIndex = Math.min(dnhIndex, ddIndex);

      geoJson.features.splice(maxIndex, 1);
      geoJson.features.splice(minIndex, 1, mergedFeature);
    }

    const boundaries: PublishedBoundary[] = geoJson.features.map(
      (feature: any, index: number) => ({
        regionId: feature.properties.id || index + 1,
        regionName:
          feature.properties.st_nm ||
          feature.properties.name ||
          `Region ${index + 1}`,
        regionCode: feature.properties.code || "",
        regionType: feature.properties.type || "State",
        boundaryGeoJSON: feature.geometry,
        boundaryType: feature.geometry.type,
        vertexCount: countVertices(feature.geometry),
        areaSqKm: 0,
        versionNumber: feature.properties.version || 1,
        publishedAt: new Date().toISOString(),
        publishedBy: 0,
      }),
    );

    // console.log(`✅ Loaded ${boundaries.length} boundaries from static file`);
    return boundaries;
  } catch (error: any) {
    console.error("❌ Error loading static boundaries:", error);
    throw error;
  }
};


/**
 * Load boundaries with fallback logic:
 * 1. Fetch Published Boundaries (API)
 * 2. Fetch All Regions (API) to get ID-Name mapping
 * 3. Fetch Static File (india.json)
 * 4. Map ID from All Regions to Static Boundaries
 * 5. Merge (API takes precedence)
 */
export const loadBoundariesWithFallback = async (
  forceRefresh = false,
): Promise<PublishedBoundary[]> => {
  try {
    // 0. Try cache first (fastest)
    const { boundaryCache } = await import("./boundaryCache");

    if (forceRefresh) {
      console.log(
        "🔥 [publicBoundaryService] Force refresh requested, clearing cache...",
      );
      await boundaryCache.clear();
    }

    const cachedBoundaries = await boundaryCache.get();

    if (cachedBoundaries && !forceRefresh) {
      console.log(
        `✅ Using cached boundaries (${cachedBoundaries.length} items)`,
      );
      return cachedBoundaries;
    }

    const token =
      sessionStorage.getItem("opti_connect_token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("opti_connect_token") ||
      localStorage.getItem("token");
    const hasToken = !!token;

    // 1. Fetch from API (Published Boundaries) - Only if authenticated
    let apiBoundaries: PublishedBoundary[] = [];
    if (hasToken) {
      try {
        const response = await getAllPublishedBoundaries();
        if (response?.boundaries) {
          // console.log(`🔥 [publicBoundaryService] API returned ${response.boundaries.length} boundaries`);
          apiBoundaries = deduplicateApiBoundaries(response.boundaries);
        }
      } catch (error) {
        console.warn(
          "⚠️ API fetch failed, proceeding with static file only",
          error,
        );
      }
    } else {
      console.log("ℹ️ [publicBoundaryService] Unauthenticated user, skipping boundary API call and using static file.");
    }

    // 2. Fetch All Regions to get valid IDs for fallback - Only if authenticated
    let regionMap = new Map<string, number>();
    if (hasToken) {
      try {
        const regionsRes = await getAllRegions();
        if (regionsRes.success && regionsRes.regions) {
          regionsRes.regions.forEach((r) => {
            const norm = r.name
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]/g, "");
            regionMap.set(norm, r.id);
          });
          // console.log(`✅ Loaded ID mapping for ${regionMap.size} regions`);
        }
      } catch (e) {
        console.warn("⚠️ Failed to fetch regions list for ID mapping", e);
      }
    }

    // 3. Load Static File (India.json) & Map Real IDs
    let staticBoundaries: PublishedBoundary[] = [];
    try {
      const rawStatic = await loadBoundariesFromStaticFile();

      // Map synthetic IDs to Real DB IDs
      if (rawStatic.length > 0) {
        staticBoundaries = rawStatic.map((b) => {
          const normName = b.regionName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]/g, "");
          const realId = regionMap.get(normName);

          if (realId) {
            return { ...b, regionId: realId };
          }
          return b;
        });
      }
    } catch (e) {
      console.error("❌ Static file load failed", e);
      // Only throw if we strictly have nothing else
      if (apiBoundaries.length === 0) throw e;
    }

    // 4. Merge - API First Approach
    const mergedBoundaries = mergeBoundaries(apiBoundaries, staticBoundaries);

    // CRITICAL FIX: Always inject Diu into "Dadra and Nagar Haveli and Daman and Diu"
    // This ensures it appears even if the API version is missing it, or if it comes from static
    const dnhIndex = mergedBoundaries.findIndex((b) => {
      const name = (b.regionName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return (
        name === "dadraandnagarhavelianddamananddiu" ||
        name === "dadraandnagarhaveli" ||
        name === "damananddiu"
      );
    });

    if (dnhIndex !== -1) {
      const target = mergedBoundaries[dnhIndex];

      // Manual Diu Polygon
      const DIU_COORDINATES = [
        [70.9, 20.71],
        [70.99, 20.71],
        [71.02, 20.713],
        [71.02, 20.73],
        [70.99, 20.73],
        [70.9, 20.73],
        [70.9, 20.71],
      ];

      // Ensure we have a valid MultiPolygon structure
      let coords: any[] = [];
      if (target.boundaryGeoJSON?.type === "Polygon") {
        coords = [target.boundaryGeoJSON.coordinates];
      } else if (target.boundaryGeoJSON?.type === "MultiPolygon") {
        coords = target.boundaryGeoJSON.coordinates;
      }

      // Check if we already have Diu (approx check by longitude)
      // Simply adding it safely as a separate polygon in MultiPolygon
      const hasDiu = coords.some((poly: any) => {
        const ring = poly[0]; // Outer ring
        return ring.some((pt: any) => Math.abs(pt[0] - 70.9) < 0.1);
      });

      if (!hasDiu) {
        // console.log("🔧 [PublicBoundaryService] Injecting missing Diu coordinates into merged boundary");
        mergedBoundaries[dnhIndex] = {
          ...target,
          regionName: "Dadra and Nagar Haveli and Daman and Diu", // Force standard name
          boundaryType: "MultiPolygon",
          boundaryGeoJSON: {
            type: "MultiPolygon",
            coordinates: [...coords, [DIU_COORDINATES]],
          },
          // Update vertex count and area to reflect change
          vertexCount: (target.vertexCount || 0) + 7
        };
      }
    } else {
        // console.warn("⚠️ [PublicBoundaryService] Could not find DNHDD boundary to inject Diu!");
    }

    // console.log(`✅ Merged Boundaries: ${mergedBoundaries.length} (API: ${apiBoundaries.length}, Static: ${staticBoundaries.length})`);

    // 5. Cache the merged result
    if (boundaryCache) {
      await boundaryCache.set(mergedBoundaries, "merged");
    }

    return mergedBoundaries;
  } catch (error) {
    console.error("❌ Critical error loading boundaries:", error);
    throw error;
  }
};

export default {
  getAllPublishedBoundaries,
  loadBoundariesFromStaticFile,
  loadBoundariesWithFallback,
};
