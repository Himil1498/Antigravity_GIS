
import type { Permission, UserRole } from '../common/index';

// Permission and Role Management
export interface RoleDefinition {
  role: UserRole;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
}

export interface PermissionDefinition {
  permission: Permission;
  name: string;
  description: string;
  category: string;
  isSystemPermission: boolean;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  company: string;
  permissions: Permission[];
  members: string[]; // User IDs
  managers: string[]; // User IDs who can manage this group
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


