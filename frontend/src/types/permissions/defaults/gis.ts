import type { PermissionDefinition } from "../permissionsModels";
import { GIS_NETWORK_PERMISSIONS } from "./gisNetworkPermissions";
import { GIS_TOOL_PERMISSIONS } from "./gisToolsPermissions";

export const GIS_PERMISSIONS: PermissionDefinition[] = [
  ...GIS_TOOL_PERMISSIONS,
  ...GIS_NETWORK_PERMISSIONS,
];

