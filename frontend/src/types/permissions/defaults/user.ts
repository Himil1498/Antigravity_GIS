import { PermissionCategory } from "../permissionsEnums";
import type { PermissionDefinition } from "../permissionsModels";

export const USER_PERMISSIONS: PermissionDefinition[] = [
  // ===== User Management =====
  {
    id: "users:view",
    name: "View Users",
    description: "Allows user to view user list",
    category: PermissionCategory.USER_MANAGEMENT,
    module: "users",
    action: "view",
    isSystemPermission: true,
  },
  {
    id: "users:create",
    name: "Create Users",
    description: "Allows user to create new users",
    category: PermissionCategory.USER_MANAGEMENT,
    module: "users",
    action: "create",
    isSystemPermission: true,
  },
  {
    id: "users:edit",
    name: "Edit Users",
    description: "Allows user to edit user information",
    category: PermissionCategory.USER_MANAGEMENT,
    module: "users",
    action: "edit",
    isSystemPermission: true,
  },
  {
    id: "users:edit:any",
    name: "Edit Any User",
    description: "Allows user to edit any user's profile",
    category: PermissionCategory.USER_MANAGEMENT,
    module: "users",
    action: "edit:any",
    isSystemPermission: true,
  },
  {
    id: "users:delete",
    name: "Delete Users",
    description: "Allows user to delete users",
    category: PermissionCategory.USER_MANAGEMENT,
    module: "users",
    action: "delete",
    isSystemPermission: true,
  },
  {
    id: "users:assign_regions",
    name: "Assign Regions to Users",
    description: "Allows user to assign regions to users",
    category: PermissionCategory.USER_MANAGEMENT,
    module: "users",
    action: "assign_regions",
    isSystemPermission: true,
  },
  {
    id: "users:assign_groups",
    name: "Assign Groups to Users",
    description: "Allows user to add users to groups",
    category: PermissionCategory.USER_MANAGEMENT,
    module: "users",
    action: "assign_groups",
    isSystemPermission: true,
  },
];

