
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

// ===== User Group =====
export interface UserGroup {
  id: string;
  name: string;                  // "Field Engineers - North"
  description: string;
  permissions: string[];         // Permission IDs
  assignedRegions: string[];     // Regions inherited by members
  members: string[];             // User IDs
  managers: string[];            // User IDs who can manage this group
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

