// ===== Permission Categories =====
export enum PermissionCategory {
  GIS_TOOLS = "GIS Tools",
  DATA_MANAGEMENT = "Data Management",
  USER_MANAGEMENT = "User Management",
  GROUP_MANAGEMENT = "Group Management",
  SETTINGS = "Settings",
  SEARCH = "Search & Navigation",
  ADMIN = "AdministrationSystem",
}

// ===== Permission Ownership Types =====
export type PermissionScope = "own" | "team" | "any";

