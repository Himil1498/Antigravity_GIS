
import { PermissionCategory } from '../permissionsEnums';
import type { PermissionDefinition } from '../permissionsModels';

export const SEARCH_PERMISSIONS: PermissionDefinition[] = [
  // ===== Search & Navigation =====
  {
    id: "search.use",
    name: "Use Search",
    description: "Allows user to use global search functionality",
    category: PermissionCategory.SEARCH,
    module: "search",
    action: "use",
    isSystemPermission: true
  },
  {
    id: "search.history.view",
    name: "View Search History",
    description: "Allows user to view search history",
    category: PermissionCategory.SEARCH,
    module: "search",
    action: "history.view",
    isSystemPermission: true
  },
  {
    id: "bookmarks.create",
    name: "Create Bookmarks",
    description: "Allows user to create location bookmarks",
    category: PermissionCategory.SEARCH,
    module: "bookmarks",
    action: "create",
    isSystemPermission: true
  },
];

