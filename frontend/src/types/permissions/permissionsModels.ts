
import type { PermissionCategory } from './permissionsEnums';

// ===== Permission Definition =====
export interface PermissionDefinition {
  id: string;                    // "gis.distance.use"
  name: string;                  // "Use Distance Tool"
  description: string;
  category: PermissionCategory;
  module: string;                // "distance", "polygon", "users"
  action: string;                // "use", "save", "delete", "view"
  isSystemPermission: boolean;   // Cannot be deleted
}

