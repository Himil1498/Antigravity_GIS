
import { PermissionCategory } from '../permissionsEnums';
import type { PermissionDefinition } from '../permissionsModels';

export const SETTINGS_PERMISSIONS: PermissionDefinition[] = [
  // ===== Settings =====
  {
    id: "settings.view",
    name: "View Settings",
    description: "Allows user to view application settings",
    category: PermissionCategory.SETTINGS,
    module: "settings",
    action: "view",
    isSystemPermission: true
  },
  {
    id: "settings.boundary.edit",
    name: "Edit Boundary Settings",
    description: "Allows user to edit boundary visualization settings",
    category: PermissionCategory.SETTINGS,
    module: "settings",
    action: "boundary.edit",
    isSystemPermission: true
  },
  {
    id: "settings.map.edit",
    name: "Edit Map Settings",
    description: "Allows user to edit map settings",
    category: PermissionCategory.SETTINGS,
    module: "settings",
    action: "map.edit",
    isSystemPermission: true
  },
];

