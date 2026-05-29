/**
 * Map Layer Utilities
 * Helper functions for loading and transforming layer data
 */

import {
  DataHubEntry,
  DataHubEntryType,
  DataHubSource,
} from "../../../types/gisToolTypes/index";
import * as apiService from "../../../services/api/index";
import { sectorRFService } from "../../../services/gisTools/index";
import {
  createOverlaysFromData,
  setOverlaysVisibility,
} from "../../../utils/layerVisualization/index";

import { User } from "../../../types/auth/authCore";

// Re-export boundary utilities
export {
  filterBoundariesByRegion,
  renderBoundaryPolygons,
} from "./boundaryLayerUtils";

/**
 * Parse user ID from various formats
 */
export const parseUserId = (user: User | null): number | undefined => {
  if (!user?.id) return undefined;
  return typeof user.id === "string"
    ? parseInt(user.id.replace("OCGID", ""))
    : user.id;
};

/**
 * Build filters based on user filter settings
 */
export const buildUserFilter = (
  userFilter: "me" | "all" | "user",
  user: User | null,
  selectedUserId: number | undefined,
  additionalFilters: Record<string, any> = {},
): Record<string, any> => {
  const filters: Record<string, any> = { ...additionalFilters };
  if (userFilter === "me" && user?.id) filters.user_id = parseUserId(user);
  else if (userFilter === "user" && selectedUserId)
    filters.user_id = selectedUserId;
  return filters;
};

/**
 * Transform infrastructure items to DataHubEntry format
 */
export const transformInfrastructureToEntries = (
  items: Record<string, unknown>[],
  type: DataHubEntryType = "Infrastructure",
): DataHubEntry[] => {
  return items.map((item: Record<string, unknown>) => ({
    id: String(item.id),
    type,
    name: String(item.name || item.item_name || item.customer_name || ""),
    createdAt: new Date(String(item.created_at || item.createdAt || "")),
    savedAt: new Date(String(item.updated_at || item.updatedAt || item.created_at || item.createdAt || "")),
    fileSize: 0,
    source: ((item.source as string) || "KML") as DataHubSource,
    data: item as unknown as DataHubEntry["data"],
  }));
};

/**
 * Transform sector RF data to DataHubEntry format
 */
export const transformSectorToEntries = (sectors: Record<string, unknown>[]): DataHubEntry[] => {
  return sectors.map((s: Record<string, unknown>) => ({
    id: `sector_${s.id}`,
    type: "SectorRF" as const,
    name: String(s.name || s.sector_name || ""),
    createdAt: new Date(String(s.created_at || s.createdAt || "")),
    savedAt: new Date(String(s.updated_at || s.updatedAt || "")),
    fileSize: 0,
    source: "Manual" as DataHubSource,
    data: s as unknown as DataHubEntry["data"],
    userId: (s.user_id || s.userId) as number | undefined,
    username: s.username as string | undefined,
  }));
};



/**
 * Load infrastructure data
 */
export const loadInfrastructureData = async (
  mapInstance: google.maps.Map,
  filters: Record<string, string | number>,
  clustererRef: React.MutableRefObject<any> | null,
  onOverlayClick: (entry: DataHubEntry) => void,
): Promise<{ count: number; overlays: unknown[] }> => {
  try {
    const { getInfrastructureByViewport } =
      await import("../../../services/apiEnhancements");

    // Default viewport if map not ready or bounds meaningless
    const bounds = mapInstance.getBounds();
    const ne = bounds?.getNorthEast();
    const sw = bounds?.getSouthWest();

    const viewParams = {
      north: ne ? ne.lat() : 90,
      south: sw ? sw.lat() : -90,
      east: ne ? ne.lng() : 180,
      west: sw ? sw.lng() : -180,
    };

    const data = await getInfrastructureByViewport(viewParams, filters);
    const items = data.data || [];

    const entries = transformInfrastructureToEntries(items);

    // Create overlays or add to clusterer
    // For now, using standard overlay creation which handles markers
    const overlays = createOverlaysFromData(
      entries,
      mapInstance,
      onOverlayClick,
    );

    return { count: entries.length, overlays };
  } catch (e) {
    console.error("Failed to load infrastructure data", e);
    return { count: 0, overlays: [] };
  }
};

/**
 * Get WebSocket action text
 */
export const getActionText = (action: string): string => {
  switch (action) {
    case "create":
      return "created";
    case "update":
      return "updated";
    case "delete":
      return "deleted";
    default:
      return "modified";
  }
};

