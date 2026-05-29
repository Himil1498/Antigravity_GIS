/**
 * DataHub Service - Main Orchestrator
 * Coordinates between backend and localStorage operations
 */

import type { DataHubEntry } from "../../types/gisToolTypes/index";
import { USE_BACKEND } from "./constants";
import { fetchFromLocalStorage, deleteFromLocalStorage } from "./localStorageService";
import {
  fetchFromBackend,
  deleteFromBackend,
  exportToBackend,
  syncToBackend as syncToBackendAPI,
  checkBackendStatus as checkBackendHealth,
} from "./backendService";

/**
 * Fetch all data entries with optional user filter
 * @param filter - 'me' (default), 'all', or 'user'
 * @param userId - user ID when filter is 'user'
 */
export const fetchAllData = async (
  filter: "me" | "all" | "user" = "me",
  userId?: number
): Promise<DataHubEntry[]> => {
  if (USE_BACKEND) {
    try {
      return await fetchFromBackend(filter, userId);
    } catch (error) {
      console.error("Backend fetch failed, falling back to localStorage:", error);
      return fetchFromLocalStorage();
    }
  }
  return fetchFromLocalStorage();
};

/**
 * Delete entries (bulk)
 */
export const deleteEntries = async (ids: string[]): Promise<void> => {
  if (USE_BACKEND) {
    try {
      await deleteFromBackend(ids);
      return;
    } catch (error) {
      console.error("Backend delete failed, falling back to localStorage:", error);
    }
  }

  // Delete from localStorage
  await deleteFromLocalStorage(ids);
};

/**
 * Export data
 */
export const exportData = async (
  entries: DataHubEntry[],
  format: string
): Promise<Blob> => {
  if (USE_BACKEND && format === "XLSX") {
    try {
      return await exportToBackend(entries, format);
    } catch (error) {
      console.error("Backend export failed:", error);
      throw error;
    }
  }

  // Client-side export
  throw new Error("Client-side export not implemented for this format");
};

/**
 * Sync data to backend
 */
export const syncToBackend = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  if (!USE_BACKEND) {
    return { success: false, message: "Backend not configured" };
  }

  const localData = await fetchFromLocalStorage();
  return syncToBackendAPI(localData);
};

/**
 * Check backend status
 */
export const checkBackendStatus = async (): Promise<boolean> => {
  if (!USE_BACKEND) return false;
  return checkBackendHealth();
};



