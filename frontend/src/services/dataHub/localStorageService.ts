/**
 * DataHub LocalStorage Service
 * Handles reading and writing to browser localStorage
 */

import type { DataHubEntry } from "../../types/gisToolTypes/index";
import { STORAGE_KEYS } from "./constants";
import { getStorageKey } from "./utils";

/**
 * Fetch all data from localStorage
 */
export const fetchFromLocalStorage = (): DataHubEntry[] => {
  const allEntries: DataHubEntry[] = [];

  try {
    // Load Distance Measurements
    const distances = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.DISTANCE) || "[]"
    );
    distances.forEach((data: any) => {
      if (data && data.id && data.name) {
        allEntries.push({
          id: data.id,
          type: "Distance",
          name: data.name,
          createdAt: new Date(data.createdAt || Date.now()),
          savedAt: new Date(data.updatedAt || data.createdAt || Date.now()),
          fileSize: JSON.stringify(data).length,
          source: "Manual",
          data: data,
        });
      }
    });

    // Load Polygons
    const polygons = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.POLYGON) || "[]"
    );
    polygons.forEach((data: any) => {
      if (data && data.id && data.name) {
        allEntries.push({
          id: data.id,
          type: "Polygon",
          name: data.name,
          createdAt: new Date(data.createdAt || Date.now()),
          savedAt: new Date(data.updatedAt || data.createdAt || Date.now()),
          fileSize: JSON.stringify(data).length,
          source: "Manual",
          data: data,
        });
      }
    });

    // Load Circles
    const circles = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CIRCLE) || "[]"
    );
    circles.forEach((data: any) => {
      if (data && data.id && data.name) {
        allEntries.push({
          id: data.id,
          type: "Circle",
          name: data.name,
          createdAt: new Date(data.createdAt || Date.now()),
          savedAt: new Date(data.updatedAt || data.createdAt || Date.now()),
          fileSize: JSON.stringify(data).length,
          source: "Manual",
          data: data,
        });
      }
    });

    // Load Elevation Profiles
    const elevations = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ELEVATION) || "[]"
    );
    elevations.forEach((data: any) => {
      if (data && data.id && data.name) {
        allEntries.push({
          id: data.id,
          type: "Elevation",
          name: data.name,
          createdAt: new Date(data.createdAt || Date.now()),
          savedAt: new Date(data.updatedAt || data.createdAt || Date.now()),
          fileSize: JSON.stringify(data).length,
          source: "Manual",
          data: data,
        });
      }
    });

    // Load Infrastructure
    const infrastructures = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.INFRASTRUCTURE) || "[]"
    );
    infrastructures.forEach((data: any) => {
      if (data && data.id && data.name) {
        allEntries.push({
          id: data.id,
          type: "Infrastructure",
          name: data.name,
          createdAt: new Date(data.createdOn || Date.now()),
          savedAt: new Date(data.updatedOn || data.createdOn || Date.now()),
          fileSize: JSON.stringify(data).length,
          source: data.source === "KML" ? "Import" : "Manual",
          data: data,
        });
      }
    });

    // Load Sector RF
    const sectorRFs = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SECTOR_RF) || "[]"
    );
    sectorRFs.forEach((data: any) => {
      if (data && data.id && data.name) {
        allEntries.push({
          id: data.id,
          type: "SectorRF",
          name: data.name,
          createdAt: new Date(data.createdAt || Date.now()),
          savedAt: new Date(data.updatedAt || data.createdAt || Date.now()),
          fileSize: JSON.stringify(data).length,
          source: "Manual",
          data: data,
        });
      }
    });

    // Sort by savedAt descending
    allEntries.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }

  return allEntries;
};

/**
 * Delete entries from localStorage
 */
export const deleteFromLocalStorage = async (ids: string[]): Promise<void> => {
  const entries = await fetchFromLocalStorage();
  const toDelete = entries.filter((e) => ids.includes(e.id));
  const byType: { [key: string]: string[] } = {};

  toDelete.forEach((entry) => {
    if (!byType[entry.type]) byType[entry.type] = [];
    byType[entry.type].push(entry.id);
  });

  Object.keys(byType).forEach((type) => {
    const storageKey = getStorageKey(type as any);
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const filtered = existing.filter(
      (item: any) => !byType[type].includes(item.id)
    );
    localStorage.setItem(storageKey, JSON.stringify(filtered));
  });
};



