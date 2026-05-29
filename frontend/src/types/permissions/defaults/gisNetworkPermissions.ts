import { PermissionCategory } from "../permissionsEnums";
import type { PermissionDefinition } from "../permissionsModels";

export const GIS_NETWORK_PERMISSIONS: PermissionDefinition[] = [
  // ===== Sector RF Module =====
  {
    id: "gis.sector.use",
    name: "Use RF Sector Tool",
    description: "Allows user to use the RF sector drawing tool",
    category: PermissionCategory.GIS_TOOLS,
    module: "sector",
    action: "use",
    isSystemPermission: true,
  },
  {
    id: "gis.sector.save",
    name: "Save RF Sectors",
    description: "Allows user to save RF sector drawings",
    category: PermissionCategory.GIS_TOOLS,
    module: "sector",
    action: "save",
    isSystemPermission: true,
  },
  {
    id: "gis.sector.edit.own",
    name: "Edit Own RF Sectors",
    description: "Allows user to edit their own RF sectors",
    category: PermissionCategory.GIS_TOOLS,
    module: "sector",
    action: "edit.own",
    isSystemPermission: true,
  },
  {
    id: "gis.sector.edit.any",
    name: "Edit Any RF Sectors",
    description: "Allows user to edit any RF sector",
    category: PermissionCategory.GIS_TOOLS,
    module: "sector",
    action: "edit.any",
    isSystemPermission: true,
  },
  {
    id: "gis.sector.delete.own",
    name: "Delete Own RF Sectors",
    description: "Allows user to delete their own RF sectors",
    category: PermissionCategory.GIS_TOOLS,
    module: "sector",
    action: "delete.own",
    isSystemPermission: true,
  },
  {
    id: "gis.sector.delete.any",
    name: "Delete Any RF Sectors",
    description: "Allows user to delete any RF sector",
    category: PermissionCategory.GIS_TOOLS,
    module: "sector",
    action: "delete.any",
    isSystemPermission: true,
  },
  {
    id: "gis.sector.import",
    name: "Import RF Sector Configurations",
    description: "Allows user to import RF sector configurations from files",
    category: PermissionCategory.GIS_TOOLS,
    module: "sector",
    action: "import",
    isSystemPermission: true,
  },
];


