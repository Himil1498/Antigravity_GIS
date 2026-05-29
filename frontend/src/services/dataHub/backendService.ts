/**
 * DataHub Backend Service
 * Handles all API communication with the backend
 */

import type { DataHubEntry } from "../../types/gisToolTypes/index";
import { API_BASE_URL, DATA_TYPES } from "./constants";
import { transformBackendItem } from "./utils";

/**
 * Fetch data from backend with optional filters
 */
export const fetchFromBackend = async (
  filter: "me" | "all" | "user" = "me",
  userId?: number
): Promise<DataHubEntry[]> => {
  // Build query params
  const params = new URLSearchParams();
  if (filter === "all") {
    params.append("filter", "all");
  } else if (filter === "user" && userId) {
    params.append("filter", "user");
    params.append("userId", userId.toString());
  }

  const url = `${API_BASE_URL}/datahub/all${
    params.toString() ? "?" + params.toString() : ""
  }`;

  // Get token from sessionStorage
  const token = sessionStorage.getItem("opti_connect_token") || localStorage.getItem("opti_connect_token");
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch data");
  const result = await response.json();

  // Process backend response
  const allItems: any[] = [];
  if (result.data) {
    // Add distances
    if (result.data.distances && Array.isArray(result.data.distances)) {
      result.data.distances.forEach((item: any) =>
        allItems.push({ ...item, type: DATA_TYPES.DISTANCE })
      );
    }
    // Add polygons
    if (result.data.polygons && Array.isArray(result.data.polygons)) {
      result.data.polygons.forEach((item: any) =>
        allItems.push({ ...item, type: DATA_TYPES.POLYGON })
      );
    }
    // Add circles
    if (result.data.circles && Array.isArray(result.data.circles)) {
      result.data.circles.forEach((item: any) =>
        allItems.push({ ...item, type: DATA_TYPES.CIRCLE })
      );
    }
    // Add elevations
    if (result.data.elevations && Array.isArray(result.data.elevations)) {
      result.data.elevations.forEach((item: any) =>
        allItems.push({ ...item, type: DATA_TYPES.ELEVATION })
      );
    }
    // Add New Inventorys
    if (
      result.data.infrastructures &&
      Array.isArray(result.data.infrastructures)
    ) {
      result.data.infrastructures.forEach((item: any) =>
        allItems.push({ ...item, type: DATA_TYPES.INFRASTRUCTURE })
      );
    }
    // Add sectors
    if (result.data.sectors && Array.isArray(result.data.sectors)) {
      result.data.sectors.forEach((item: any) =>
        allItems.push({ ...item, type: DATA_TYPES.SECTOR_RF })
      );
    }
  }

  // Transform all items
  return allItems.map(transformBackendItem);
};

/**
 * Delete entries via backend API
 */
export const deleteFromBackend = async (ids: string[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/datahub/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) throw new Error("Failed to delete");
};

/**
 * Export data via backend
 */
export const exportToBackend = async (
  entries: DataHubEntry[],
  format: string
): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/datahub/export/${format}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });
  if (!response.ok) throw new Error("Failed to export");
  return await response.blob();
};

/**
 * Sync localStorage data to backend
 */
export const syncToBackend = async (
  localData: DataHubEntry[]
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/data-hub/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: localData }),
    });

    if (!response.ok) throw new Error("Sync failed");

    const result = await response.json();
    return { success: true, message: `Synced ${result.count} items` };
  } catch (error) {
    console.error("Sync to backend failed:", error);
    return { success: false, message: "Sync failed" };
  }
};

/**
 * Check backend health status
 */
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
};



