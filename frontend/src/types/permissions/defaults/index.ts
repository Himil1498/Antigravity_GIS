import type { PermissionDefinition } from "../permissionsModels";

import { GIS_PERMISSIONS } from "./gis";
import { DATA_PERMISSIONS } from "./data";
import { USER_PERMISSIONS } from "./user";
import { GROUP_PERMISSIONS } from "./group";
import { SETTINGS_PERMISSIONS } from "./settings";
import { SEARCH_PERMISSIONS } from "./search";
import { DEFAULT_ROLE_PERMISSIONS } from "./roles";
import { ADMIN_PERMISSIONS } from "./adminPermissions";

// Re-export specific modules
export * from "./gis";
export * from "./data";
export * from "./user";
export * from "./group";
export * from "./settings";
export * from "./search";
export * from "./roles";
export * from "./adminPermissions";

// Aggregate all system permissions
export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  ...GIS_PERMISSIONS,
  ...DATA_PERMISSIONS,
  ...USER_PERMISSIONS,
  ...GROUP_PERMISSIONS,
  ...SETTINGS_PERMISSIONS,
  ...SEARCH_PERMISSIONS,
  ...ADMIN_PERMISSIONS,
];

