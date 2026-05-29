import type { BoundaryStatus } from "./types";
import { loadBoundariesWithFallback } from "../../services/region/publicBoundaryService";

let indiaBoundaryPolygons: google.maps.Polygon[] | null = null;
let isLoading = false;
let loadError: string | null = null;

/**
 * Load India boundaries (merging dynamic API adjustments and static fallbacks)
 */
export const loadIndiaBoundary = async (forceRefresh = false): Promise<void> => {
  if ((indiaBoundaryPolygons && !forceRefresh) || isLoading) {
    return;
  }

  // Check if Google Maps API is loaded
  if (typeof google === 'undefined' || !google.maps || !google.maps.Polygon) {
    console.warn('Google Maps API not ready yet, will retry...');
    // Retry after a short delay
    setTimeout(() => loadIndiaBoundary(forceRefresh), 500);
    return;
  }

  isLoading = true;

  try {
    const boundaries = await loadBoundariesWithFallback(forceRefresh);
    
    // Construct unified GeoJSON FeatureCollection in window for region detection
    const geoJson = {
      type: 'FeatureCollection',
      features: boundaries.map(b => ({
        type: 'Feature',
        properties: {
          id: b.regionId,
          st_nm: b.regionName,
          name: b.regionName,
          code: b.regionCode,
          type: b.regionType,
          version: b.versionNumber
        },
        geometry: b.boundaryGeoJSON
      }))
    };

    (window as any).indiaGeoJson = geoJson;
    const polygons: google.maps.Polygon[] = [];

    // Process features and create polygons
    if (geoJson.features && geoJson.features.length > 0) {
      geoJson.features.forEach((feature: any) => {
        if (feature.geometry && feature.geometry.type === 'Polygon') {
          const coordinates = feature.geometry.coordinates[0].map(
            (coord: number[]) => ({
              lat: coord[1],
              lng: coord[0]
            })
          );

          const polygon = new google.maps.Polygon({
            paths: coordinates
          });

          polygons.push(polygon);
        } else if (feature.geometry && feature.geometry.type === 'MultiPolygon') {
          // Handle MultiPolygon (states with multiple parts)
          feature.geometry.coordinates.forEach((polygonCoords: number[][][]) => {
            const coordinates = polygonCoords[0].map((coord: number[]) => ({
              lat: coord[1],
              lng: coord[0]
            }));

            const polygon = new google.maps.Polygon({
              paths: coordinates
            });

            polygons.push(polygon);
          });
        }
      });
    }

    indiaBoundaryPolygons = polygons;
    
  } catch (error) {
    console.error('Error loading India boundary:', error);
    loadError = error instanceof Error ? error.message : 'Unknown error';
    throw error;
  } finally {
    isLoading = false;
  }
};

/**
 * Force refresh and reload geofence boundaries in real-time
 */
export const reloadIndiaBoundary = async (): Promise<void> => {
  await loadIndiaBoundary(true);
};

/**
 * Get the loaded polygons (internal use only)
 */
export const getIndiaBoundaryPolygons = (): google.maps.Polygon[] | null => {
  return indiaBoundaryPolygons;
};

/**
 * Get boundary loading status
 */
export const getBoundaryStatus = (): BoundaryStatus => {
  return {
    loaded: indiaBoundaryPolygons !== null,
    loading: isLoading,
    error: loadError
  };
};

