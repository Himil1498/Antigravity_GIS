import { useState, useEffect, useCallback } from "react";
import {
  getRegionById,
  getRegionBoundary,
  getDraftBoundary,
  Region,
  Boundary,
} from "../../../../services/region/index";
import { calculateBoundaryCenter } from "../utils/index";
import { GeoJSONGeometry } from "../types/index";

export const useRegionData = (regionId: number) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [boundaryData, setBoundaryData] = useState<Boundary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [mapZoom, setMapZoom] = useState(5);

  const fetchRegion = useCallback(async () => {
    try {
      const response = await getRegionById(regionId);
      setRegion(response.region);
    } catch (err: any) {
      console.error("Failed to fetch region:", err);
      setError("Failed to load region details");
    }
  }, [regionId]);

  const fetchBoundary = useCallback(async () => {
    try {
      setLoading(true);
      let boundary: Boundary | null = null;

      // 1. Try Draft
      try {
        const draftResponse = await getDraftBoundary(regionId);
        if (draftResponse && draftResponse.draft) {
          const d = draftResponse.draft as any;
          boundary = {
            id: d.id,
            regionId: d.regionId || d.region_id,
            boundaryGeojson:
              d.boundaryGeojson || d.boundary_geojson || d.geojson,
            geojson: d.geojson || d.boundary_geojson,
            boundaryType: (d.boundaryType || d.type || d.boundary_type) as
              | "Polygon"
              | "MultiPolygon",
            type: d.type || d.boundary_type,
            version: d.versionNumber || d.version_number,
            vertexCount: d.vertexCount || d.vertex_count,
            areaSqkm: d.areaSqKm || d.area_sqkm,
            createdBy: d.createdBy || d.created_by,
            createdByName: d.createdByName || d.created_by_name,
            createdAt: d.createdAt || d.created_at,
            updatedAt: d.updatedAt || d.updated_at || d.created_at,
            isActive: false,
            source: d.source,
            notes: d.notes,
          };
          console.log("📝 Loaded DRAFT boundary for editing", boundary);
        }
      } catch (e) {
        /* No draft */
      }

      // 2. Try Published
      if (!boundary) {
        try {
          const response = await getRegionBoundary(regionId);
          boundary = response.boundary;
          console.log("✅ Loaded PUBLISHED boundary");
        } catch (e) {
          /* No published */
        }
      }

      // 3. Try Fallback (india.json)
      if (!boundary && region) {
        try {
          const indiaResponse = await fetch("/india.json");
          const indiaData = await indiaResponse.json();

          const normalize = (str: string) =>
            str
              ?.toLowerCase()
              .trim()
              .replace(/[^a-z0-9]/g, "") || "";
          const targetName = normalize(region.name);

          let regionBoundary = indiaData.features?.find((f: any) => {
            const pName = normalize(f.properties?.name);
            const pStNm = normalize(f.properties?.st_nm);
            return pName === targetName || pStNm === targetName;
          });

          // Special Case: Handle merged "Dadra and Nagar Haveli and Daman and Diu"
          if (
            !regionBoundary &&
            targetName.includes("dadra") &&
            targetName.includes("daman")
          ) {
            const dnh = indiaData.features?.find(
              (f: any) =>
                normalize(f.properties?.st_nm) === "dadraandnagarhaveli",
            );
            const dd = indiaData.features?.find(
              (f: any) => normalize(f.properties?.st_nm) === "damananddiu",
            );

            if (dnh && dd) {
              console.log(
                "Found component regions for merged UT:",
                dnh.properties.st_nm,
                dd.properties.st_nm,
              );
              // Merge into a MultiPolygon
              const dnhCoords =
                dnh.geometry.type === "Polygon"
                  ? [dnh.geometry.coordinates]
                  : dnh.geometry.coordinates;
              const ddCoords =
                dd.geometry.type === "Polygon"
                  ? [dd.geometry.coordinates]
                  : dd.geometry.coordinates;

              // Diu Island (Approximate Polygon for fallback)
              const DIU_COORDINATES = [
                [70.9, 20.71],
                [70.99, 20.71],
                [71.02, 20.713],
                [71.02, 20.73],
                [70.99, 20.73],
                [70.9, 20.73],
                [70.9, 20.71],
              ];

              regionBoundary = {
                type: "Feature",
                properties: { st_nm: region.name },
                geometry: {
                  type: "MultiPolygon",
                  coordinates: [...dnhCoords, ...ddCoords, [DIU_COORDINATES]],
                },
              };
            }
          }

          if (regionBoundary?.geometry) {
            let vertexCount = 0;
            if (regionBoundary.geometry.type === "Polygon") {
              regionBoundary.geometry.coordinates.forEach(
                (ring: any) => (vertexCount += ring.length),
              );
            } else if (regionBoundary.geometry.type === "MultiPolygon") {
              regionBoundary.geometry.coordinates.forEach((polygon: any) => {
                polygon.forEach((ring: any) => (vertexCount += ring.length));
              });
            }

            boundary = {
              id: 0,
              regionId: regionId,
              boundaryGeojson: regionBoundary.geometry,
              geojson: regionBoundary.geometry,
              boundaryType: regionBoundary.geometry.type as
                | "Polygon"
                | "MultiPolygon",
              type: regionBoundary.geometry.type,
              version: 0,
              vertexCount,
              areaSqkm: 0,
              createdBy: 0,
              createdByName: "india.json",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isActive: false,
              source: "india.json",
              notes: "Loaded from india.json fallback",
            };
            console.log(
              `🇮🇳 Loaded boundary from india.json fallback for ${region.name}`,
            );
          }
        } catch (e) {
          console.log("Failed to load from india.json");
        }
      }

      // 4. Normalize
      if (boundary) {
        // Handle various casing from different API endpoints (snake_case vs camelCase)
        const b = boundary as any;
        if (!boundary.geojson) {
          boundary.geojson =
            b.geojson ||
            b.boundaryGeojson ||
            b.boundaryGeoJSON ||
            b.boundary_geojson;
        }
        if (!boundary.type) {
          boundary.type = b.type || b.boundaryType || b.boundary_type;
        }

        if (boundary.geojson) {
          const center = calculateBoundaryCenter(
            boundary.geojson as GeoJSONGeometry,
          );
          setMapCenter(center);
          setMapZoom(8);
        } else {
          console.warn("Boundary data loaded but missing geojson:", boundary);
        }
      }

      setBoundaryData(boundary);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching boundary:", err);
      setError("An unexpected error occurred while loading boundary data");
      setLoading(false);
    }
  }, [regionId, region]);

  useEffect(() => {
    fetchRegion();
  }, [fetchRegion]);
  useEffect(() => {
    if (region) fetchBoundary();
  }, [fetchBoundary, region]);

  return {
    region,
    setRegion,
    boundaryData,
    setBoundaryData,
    loading,
    setLoading,
    error,
    setError,
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
    fetchBoundary,
    fetchRegion,
  };
};
