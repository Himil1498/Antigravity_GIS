// Default permissions for each role
// IMPORTANT: Role defaults should ONLY include:
// 1. Navigation access (e.g., "users:view", "map:view") — lets user see the page
// 2. GIS tool access — map tools the role can use
// 3. Data access scope — own vs all
// ALL action-level permissions (create, edit, delete, manage_permissions, etc.)
// must be EXPLICITLY assigned via the Permissions Dialog per user.
// Matches Frontend/src/types/permissions/defaults/roles.ts
const DEFAULT_ROLE_PERMISSIONS = {
  admin: ["*"], // Wildcard handled by logic

  manager: [
    // GIS Tools
    "gis.distance.use",
    "gis.distance.save",
    "gis.distance.delete.any",
    "gis.polygon.use",
    "gis.polygon.save",
    "gis.polygon.delete.any",
    "gis.circle.use",
    "gis.circle.save",
    "gis.circle.delete.any",
    "gis.elevation.use",
    "gis.elevation.save",
    "gis.elevation.delete.any",
    "gis.infrastructure.use",
    "gis.infrastructure.save",
    "gis.infrastructure.delete.any",
    "gis.infrastructure.import",
    // Data Management
    "data.view.all",
    "data.edit.all",
    "data.delete.all",
    "data.export",
    // Granular Network Infrastructure
    "network:file:edit_planned",
    "network:file:live_edit_planned",
    "network:file:delete_file_planned",
    "network:file:delete_feature_planned",
    "network:file:edit_live",
    "network:file:live_edit_live",
    "network:file:delete_file_live",
    "network:file:delete_feature_live",
    "network:file:edit_imported",
    "network:file:live_edit_imported",
    "network:file:delete_file_imported",
    "network:file:delete_feature_imported",
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
    // GIS Tools
    "gis.distance.use",
    "gis.distance.save",
    "gis.distance.delete.own",
    "gis.polygon.use",
    "gis.polygon.save",
    "gis.polygon.delete.own",
    "gis.circle.use",
    "gis.circle.save",
    "gis.circle.delete.own",
    "gis.elevation.use",
    "gis.elevation.save",
    "gis.elevation.delete.own",
    "gis.infrastructure.use",
    "gis.infrastructure.save",
    "gis.infrastructure.delete.own",
    // Data
    "data.view.own",
    "data.edit.own",
    "data.delete.own",
    // Navigation Access ONLY
    "users:view",
    "map:view",
    "datahub:view",
    "network:view",
    "dashboard:view",
    // Settings
    "settings.view",
    // Search
    "search.use",
    "bookmarks.create",
  ],

  user: [
    // GIS Tools (Basic)
    "gis.distance.use",
    "gis.distance.save",
    "gis.polygon.use",
    "gis.circle.use",
    // Data
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
    // GIS Tools - Full access
    "gis.distance.use",
    "gis.distance.save",
    "gis.distance.delete.any",
    "gis.polygon.use",
    "gis.polygon.save",
    "gis.polygon.delete.any",
    "gis.circle.use",
    "gis.circle.save",
    "gis.circle.delete.any",
    "gis.elevation.use",
    "gis.elevation.save",
    "gis.elevation.delete.any",
    "gis.infrastructure.use",
    "gis.infrastructure.save",
    "gis.infrastructure.delete.any",
    "gis.infrastructure.import",
    // Data Management - Full access
    "data.view.all",
    "data.edit.all",
    "data.delete.all",
    "data.export",
    // Granular Network Infrastructure
    "network:file:edit_planned",
    "network:file:live_edit_planned",
    "network:file:delete_file_planned",
    "network:file:delete_feature_planned",
    "network:file:edit_live",
    "network:file:live_edit_live",
    "network:file:delete_file_live",
    "network:file:delete_feature_live",
    "network:file:edit_imported",
    "network:file:live_edit_imported",
    "network:file:delete_file_imported",
    "network:file:delete_feature_imported",
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
  ],
};

module.exports = { DEFAULT_ROLE_PERMISSIONS };
