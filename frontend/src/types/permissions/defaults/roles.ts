// ===== Default Permission Sets by Role =====
// IMPORTANT: Role defaults should ONLY include:
// 1. Navigation access (e.g., "users:view", "map:view") — lets user see the page
// 2. GIS tool access — map tools the role can use
// 3. Data access scope — own vs all
// ALL action-level permissions (create, edit, delete, manage_permissions, etc.)
// must be EXPLICITLY assigned via the Permissions Dialog per user.
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ["*"], // Wildcard - all permissions

  manager: [
    // GIS Tools - Full access
    "gis.infrastructure.use",
    "gis.infrastructure.save",
    "gis.infrastructure.delete.any",
    "gis.infrastructure.import",

    // Data Management
    "data.view.all",
    "data.edit.all",
    "data.delete.all",
    "data.export",

    // Navigation Access ONLY — no action-level user/group/admin permissions
    "users:view",
    "groups:view",
    "map:view",
    "datahub:view",
    "network:view",
    "dashboard:view",
    "analytics:view",

    // Settings
    "settings.view",
    "settings.boundary.edit",
    "settings.map.edit",

    // Search
    "search.use",
    "search.history.view",
    "bookmarks.create",
  ],

  technician: [
    // GIS Tools - Own data only
    "gis.infrastructure.use",
    "gis.infrastructure.save",
    "gis.infrastructure.delete.own",

    // Data Management - Own only
    "data.view.own",
    "data.edit.own",
    "data.delete.own",

    // Navigation Access ONLY
    "users:view",
    "map:view",
    "datahub:view",
    "network:view",
    "dashboard:view",

    // Settings - View only
    "settings.view",

    // Search
    "search.use",
    "bookmarks.create",
  ],

  user: [

    // Data Management - View own only
    "data.view.own",

    // Navigation Access ONLY
    "users:view",
    "map:view",
    "datahub:view",
    "network:view",
    "dashboard:view",

    // Search
    "search.use",
  ],

  developer: [
    // GIS Tools - All
    "gis.infrastructure.use",
    "gis.infrastructure.save",
    "gis.infrastructure.delete.any",
    "gis.infrastructure.import",

    // Data Management
    "data.view.all",
    "data.edit.all",
    "data.delete.all",
    "data.export",

    // Navigation Access ONLY — no action-level user permissions
    "users:view",
    "map:view",
    "datahub:view",
    "network:view",
    "dashboard:view",
    "analytics:view",

    // Settings
    "settings.view",
    "settings.boundary.edit",
    "settings.map.edit",

    // Search
    "search.use",
    "search.history.view",
    "bookmarks.create",
  ]
};

