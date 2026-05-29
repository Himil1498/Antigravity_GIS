import type { Permission } from "../../types/common/index";

// Role hierarchy (higher number = more privileges)
export const ROLE_HIERARCHY: Record<string, number> = {
  user: 1,
  technician: 2,
  manager: 3,
  developer: 3, // Same level as Manager but tech focus
  admin: 4,
};

// Default permissions for each role
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    "users:create",
    "users:view",
    "users:update",
    "users:delete",
    "towers:create",
    "towers:read",
    "towers:update",
    "towers:delete",
    "analytics:read",
    "analytics:export",
    "settings:read",
    "settings:update",
    "audit:read",
  ],
  developer: [
    "users:view",
    "users:update",
    "users:create",
    "towers:create",
    "towers:read",
    "towers:update",
    "towers:delete",
    "analytics:read",
    "settings:read",
    "audit:read",
    "map:*",
    "network:view",
    "datahub:view",
    "dashboard:view",
  ],
  manager: [
    "users:view",
    "users:update",
    "towers:create",
    "towers:read",
    "towers:update",
    "analytics:read",
    "analytics:export",
  ],
  technician: [
    "towers:create",
    "towers:read",
    "towers:update",
    "analytics:read",
  ],
  user: ["towers:read", "analytics:read"],
};

