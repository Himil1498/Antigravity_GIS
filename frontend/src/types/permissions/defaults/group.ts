import { PermissionCategory } from "../permissionsEnums";
import type { PermissionDefinition } from "../permissionsModels";

export const GROUP_PERMISSIONS: PermissionDefinition[] = [
  // ===== Group Management =====
  {
    id: "groups:view",
    name: "View Groups",
    description: "Allows user to view user groups",
    category: PermissionCategory.GROUP_MANAGEMENT,
    module: "groups",
    action: "view",
    isSystemPermission: true,
  },
  {
    id: "groups:create",
    name: "Create Groups",
    description: "Allows user to create new groups",
    category: PermissionCategory.GROUP_MANAGEMENT,
    module: "groups",
    action: "create",
    isSystemPermission: true,
  },
  {
    id: "groups:edit",
    name: "Edit Groups",
    description: "Allows user to edit group details",
    category: PermissionCategory.GROUP_MANAGEMENT,
    module: "groups",
    action: "edit",
    isSystemPermission: true,
  },
  {
    id: "groups:delete",
    name: "Delete Groups",
    description: "Allows user to delete groups",
    category: PermissionCategory.GROUP_MANAGEMENT,
    module: "groups",
    action: "delete",
    isSystemPermission: true,
  },
];

