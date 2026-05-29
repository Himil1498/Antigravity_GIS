/**
 * Boundary Layer Utilities
 * Helper functions for region boundary rendering
 */

import React from "react";
import { PublishedBoundary } from "../../../services/region/publicBoundaryService";

/**
 * Filter boundaries by assigned regions
 */
export const filterBoundariesByRegion = (
  boundaries: PublishedBoundary[],
  assignedRegions: string[],
): PublishedBoundary[] => {
  const hasAllIndia = assignedRegions.some(
    (r) => r.toLowerCase() === "all india",
  );

  if (hasAllIndia) return boundaries;
  if (assignedRegions.length === 0) return [];

  // Normalize helper
  const norm = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");

  // Normalized assigned regions
  const normalizedAssigned = assignedRegions.map(norm);

  return boundaries.filter((b) => {
    const bName = norm(String(b.regionName));

    // Check direct match or substring
    const match = normalizedAssigned.some((rName) => {
      // Standard check
      if (bName === rName || bName.includes(rName) || rName.includes(bName))
        return true;

      // Special Case: DNHDD
      // If boundary is "Dadra and Nagar Haveli and Daman and Diu"
      // Allow matching if user has access to EITHER "Dadra..." OR "Daman..."
      if (bName === "dadraandnagarhavelianddamananddiu") {
        if (rName.includes("dadra") || rName.includes("daman")) return true;
      }

      return false;
    });

    return match;
  });
};

/**
 * Create a boundary polygon with event handlers
 */
export const createBoundaryPolygon = (
  mapInstance: google.maps.Map,
  paths: google.maps.LatLngLiteral[][],
  color: string,
  strokeColor: string,
  strokeWeight: number,
  isMonochrome: boolean,
  activeGISToolRef: React.MutableRefObject<string | null>,
  polygonsRef: React.MutableRefObject<google.maps.Polygon[]>,
): void => {
  const poly = new google.maps.Polygon({
    paths,
    strokeColor,
    strokeOpacity: 1,
    strokeWeight,
    fillColor: color,
    fillOpacity: 0,
    map: mapInstance,
    clickable: true,
    zIndex: 1,
  });

  google.maps.event.addListener(poly, "mouseover", () =>
    poly.setOptions({ fillOpacity: 0, strokeWeight: 3, zIndex: 2 }),
  );
  google.maps.event.addListener(poly, "mouseout", () =>
    poly.setOptions({ fillOpacity: 0, strokeWeight, zIndex: 1 }),
  );
  google.maps.event.addListener(poly, "click", (e: google.maps.MapMouseEvent) => {
    // Always propagate click to map instance to ensure overlays like Deck.gl receive it
    // This allows InfoWindows to work even if the boundary polygon intercepts the initial click
    google.maps.event.trigger(mapInstance, "click", e);
  });

  // Propagate mousemove so LiveCoordinates works over the polygon
  google.maps.event.addListener(poly, "mousemove", (e: google.maps.MapMouseEvent) => {
    google.maps.event.trigger(mapInstance, "mousemove", e);
  });

  polygonsRef.current.push(poly);
};

/**
 * Render boundary polygons from GeoJSON
 */
export const renderBoundaryPolygons = (
  mapInstance: google.maps.Map,
  boundaries: PublishedBoundary[],
  palette: { fill: string }[],
  isMonochrome: boolean,
  activeGISToolRef: React.MutableRefObject<string | null>,
  polygonsRef: React.MutableRefObject<google.maps.Polygon[]>,
): void => {
  const BATCH_SIZE = 3; // Reduced batch size to prevent frame drops
  let currentIndex = 0;

  const processBatch = () => {
    const end = Math.min(currentIndex + BATCH_SIZE, boundaries.length);

    for (let i = currentIndex; i < end; i++) {
      const b = boundaries[i];
      const geo = b.boundaryGeoJSON || (b as unknown as Record<string, unknown>).boundaryGeojson || (b as unknown as Record<string, unknown>).boundary_geojson;
      if (!geo?.coordinates) continue;

      const color = palette[i % palette.length].fill;
      const strokeColor = isMonochrome ? "#0D47A1" : color;
      const strokeWeight = isMonochrome ? 3 : 2;

      const createPoly = (coords: number[][][]) => {
        const paths = coords.map((ring: number[][]) =>
          ring.map(([lng, lat]: number[]) => ({ lat, lng })),
        );
        createBoundaryPolygon(
          mapInstance,
          paths,
          color,
          strokeColor,
          strokeWeight,
          isMonochrome,
          activeGISToolRef,
          polygonsRef,
        );
      };

      if (geo.type === "Polygon") {
        createPoly(geo.coordinates);
      } else if (geo.type === "MultiPolygon") {
        geo.coordinates.forEach((part: number[][][]) => createPoly(part));
      }
    }

    currentIndex = end;

    if (currentIndex < boundaries.length) {
      setTimeout(processBatch, 0); // Yield to main thread
    }
  };

  processBatch();
};
