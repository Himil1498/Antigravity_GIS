
export type GISToolType =
  | "elevation"
  | "distance"
  | "polygon"
  | "circle"
  | "sector"
  | "infrastructure";

export interface TemporaryStorageItem {
  id: string;
  userId: string;
  toolType: GISToolType;
  storageType: "temporary";
  name: string;
  data: any; // The actual GIS data
  createdAt: number; // Timestamp
  expiresAt: number; // Timestamp (24 hours from creation)
}

export interface StorageStats {
  total: number;
  byTool: Record<GISToolType, number>;
  nearExpiry: number; // Items expiring in < 2 hours
}

