/**
 * Boundary merge utilities
 * Helpers for merging API and static boundaries
 */

import type { PublishedBoundary } from "./publicBoundaryService";

/**
 * Normalize names for comparison
 */
export const normalizeName = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");

/**
 * Common State Name Mappings (Static File vs DB)
 */
export const STATE_ALIASES: Record<string, string> = {
  orissa: "odisha",
  odisha: "orissa",
  uttaranchal: "uttarakhand",
  uttarakhand: "uttaranchal",
  pondicherry: "puducherry",
  puducherry: "pondicherry",
  jammuandkashmir: "jammu & kashmir",
  "jammu & kashmir": "jammuandkashmir",
  andamanandnicobarislands: "andaman & nicobar islands",
  "andaman & nicobar islands": "andamanandnicobarislands",
  dadraandnagarhavelianddamananddiu: "dadra and nagar haveli and daman and diu",
};

/**
 * Deduplicate API boundaries: Keep only the highest version per region
 */
export const deduplicateApiBoundaries = (
  boundaries: PublishedBoundary[],
): PublishedBoundary[] => {
  const highestVersions = new Map<number, PublishedBoundary>();

  boundaries.forEach((b) => {
    if (!highestVersions.has(b.regionId)) {
      highestVersions.set(b.regionId, b);
    } else {
      const existing = highestVersions.get(b.regionId)!;
      if (b.versionNumber > existing.versionNumber) {
        highestVersions.set(b.regionId, b);
      }
    }
  });

  return Array.from(highestVersions.values());
};

/**
 * Check if a static boundary is covered by any API boundary
 */
export const isStaticBoundaryCovered = (
  staticBoundary: PublishedBoundary,
  apiIds: Set<string>,
  apiNames: Set<string>,
): boolean => {
  // Check ID match
  if (staticBoundary.regionId) {
    if (apiIds.has(String(staticBoundary.regionId))) return true;
  }

  // Check Name match (Direct)
  if (staticBoundary.regionName) {
    const sName = normalizeName(staticBoundary.regionName);
    if (apiNames.has(sName)) return true;

    // Check Aliases
    if (
      STATE_ALIASES[sName] &&
      apiNames.has(normalizeName(STATE_ALIASES[sName]))
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Merge API and static boundaries
 * API boundaries take priority, static boundaries fill gaps
 */
export const mergeBoundaries = (
  apiBoundaries: PublishedBoundary[],
  staticBoundaries: PublishedBoundary[],
): PublishedBoundary[] => {
  const mergedBoundaries: PublishedBoundary[] = [...apiBoundaries];

  // Create lookup sets for API regions
  const apiIds = new Set<string>();
  const apiNames = new Set<string>();

  apiBoundaries.forEach((b) => {
    if (b.regionId !== undefined && b.regionId !== null)
      apiIds.add(String(b.regionId));
    if (b.regionName) apiNames.add(normalizeName(b.regionName));
  });

  // Add static boundaries that are not covered by API
  staticBoundaries.forEach((staticBoundary) => {
    // Check if covered by API
    if (!isStaticBoundaryCovered(staticBoundary, apiIds, apiNames)) {
      mergedBoundaries.push(staticBoundary);
    }
  });

  return mergedBoundaries;
};

/**
 * Count vertices in a GeoJSON geometry
 */
export function countVertices(geometry: any): number {
  let count = 0;

  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach((ring: number[][]) => {
      count += ring.length;
    });
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((polygon: number[][][]) => {
      polygon.forEach((ring: number[][]) => {
        count += ring.length;
      });
    });
  }

  return count;
}

