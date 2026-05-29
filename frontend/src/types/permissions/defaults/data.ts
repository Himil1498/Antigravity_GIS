
import { PermissionCategory } from '../permissionsEnums';
import type { PermissionDefinition } from '../permissionsModels';

export const DATA_PERMISSIONS: PermissionDefinition[] = [
  // ===== Data Management =====
  {
    id: "data.view.own",
    name: "View Own Data",
    description: "Allows user to view their own saved data",
    category: PermissionCategory.DATA_MANAGEMENT,
    module: "data",
    action: "view.own",
    isSystemPermission: true
  },
  {
    id: "data.view.all",
    name: "View All Data",
    description: "Allows user to view all saved data",
    category: PermissionCategory.DATA_MANAGEMENT,
    module: "data",
    action: "view.all",
    isSystemPermission: true
  },
  {
    id: "data.edit.own",
    name: "Edit Own Data",
    description: "Allows user to edit their own data",
    category: PermissionCategory.DATA_MANAGEMENT,
    module: "data",
    action: "edit.own",
    isSystemPermission: true
  },
  {
    id: "data.edit.all",
    name: "Edit All Data",
    description: "Allows user to edit any data",
    category: PermissionCategory.DATA_MANAGEMENT,
    module: "data",
    action: "edit.all",
    isSystemPermission: true
  },
  {
    id: "data.delete.own",
    name: "Delete Own Data",
    description: "Allows user to delete their own data",
    category: PermissionCategory.DATA_MANAGEMENT,
    module: "data",
    action: "delete.own",
    isSystemPermission: true
  },
  {
    id: "data.delete.all",
    name: "Delete All Data",
    description: "Allows user to delete any data",
    category: PermissionCategory.DATA_MANAGEMENT,
    module: "data",
    action: "delete.all",
    isSystemPermission: true
  },
  {
    id: "data.export",
    name: "Export Data",
    description: "Allows user to export data to various formats",
    category: PermissionCategory.DATA_MANAGEMENT,
    module: "data",
    action: "export",
    isSystemPermission: true
  },
  {
    id: "gis.sector.export",
    name: "Export RF Sector Data",
    description: "Allows user to export RF sectors to various formats",
    category: PermissionCategory.DATA_MANAGEMENT,
    module: "sector",
    action: "export",
    isSystemPermission: true
  }
];

