import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderAccessTree } from "./FolderAccessTree";
import { VISIBLE_PERMISSIONS } from "./permissionConfig";
import {
  PermissionCatalog,
  FolderAccessAssignment,
} from "../../../../services/userPermissionApiService";
import RegionSelector from "../RegionSelector/index";
import { INDIAN_STATES } from "../../constants/indianStates";

interface UserPermissionsDialogContentProps {
  isLoading: boolean;
  activeTab: "permissions" | "folders";
  setActiveTab: (tab: "permissions" | "folders") => void;
  catalog: PermissionCatalog;
  selectedPermissions: string[];
  groupPermissions: string[];
  // folderTree: any[]; // Deprecated
  infrastructureFolders: any[];
  customerFolders: any[];
  othersFolders: any[];
  folderAssignments: FolderAccessAssignment[];
  folderAddAssignments: FolderAccessAssignment[];
  assignedRegions: string[];
  setAssignedRegions: (regions: string[]) => void;
  togglePermission: (id: string) => void;
  togglePermissionGroup: (ids: string[], checked: boolean) => void;
  selectAllPermissionsInCategory: (category: string) => void;
  selectAllPermissions: () => void;
  toggleFolderAccess: (folderId: number, checked: boolean) => void;
  toggleCategoryFolderAccess: (folders: any[], checked: boolean) => void;
  toggleFolderAddAccess: (folderId: number, checked: boolean) => void;
  toggleCategoryFolderAddAccess: (folders: any[], checked: boolean) => void;
  user: any;
}

const UserPermissionsDialogContent: React.FC<
  UserPermissionsDialogContentProps
> = ({
  isLoading,
  activeTab,
  catalog,
  selectedPermissions,
  groupPermissions,
  infrastructureFolders,
  customerFolders,
  othersFolders,
  folderAssignments,
  folderAddAssignments,
  assignedRegions,
  setAssignedRegions,
  togglePermission,
  togglePermissionGroup,
  selectAllPermissionsInCategory,
  selectAllPermissions,
  toggleFolderAccess,
  toggleCategoryFolderAccess,
  toggleFolderAddAccess,
  toggleCategoryFolderAddAccess,
  user,
  setActiveTab,
}) => {
  const PLANNED_GROUP = [
    "network:file:edit_planned",
    "network:file:live_edit_planned",
    "network:file:delete_file_planned",
    "network:file:delete_feature_planned",
  ];

  const LIVE_GROUP = [
    "network:file:edit_live",
    "network:file:live_edit_live",
    "network:file:delete_file_live",
    "network:file:delete_feature_live",
  ];

  const IMPORTED_GROUP = [
    "network:file:edit_imported",
    "network:file:live_edit_imported",
    "network:file:delete_file_imported",
    "network:file:delete_feature_imported",
  ];

  console.log("[UserPermissionsDialogContent] Props:", { 
    groupPermissions, 
    selectedPermissions,
    assignedRegions,
    folderAssignmentCount: folderAssignments.length 
  });
  // --- Config for Sidebar ---
  const [activeCategory, setActiveCategory] = useState<string>("map");

  // Global Documentation Toggle State
  const [showDetailedDocs, setShowDetailedDocs] = useState<boolean>(false);

  type ThemeColor =
    | "blue"
    | "purple"
    | "indigo"
    | "green"
    | "emerald"
    | "orange"
    | "teal"
    | "red"
    | "pink"
    | "cyan"
    | "amber";

  interface CategoryConfig {
    id: string;
    label: string;
    icon: string;
    theme: ThemeColor;
  }

  const CATEGORIES: CategoryConfig[] = [
    { id: "map", label: "Map", icon: "🗺️", theme: "blue" },
    { id: "network", label: "Network Planning", icon: "🌐", theme: "indigo" },
    { id: "dashboard", label: "Dashboard", icon: "📊", theme: "green" },
    { id: "users", label: "Users", icon: "👤", theme: "orange" },
    { id: "groups", label: "Groups", icon: "👥", theme: "teal" },
    { id: "admin", label: "Admin", icon: "🛡️", theme: "red" },
    { id: "analytics", label: "Analytics", icon: "📈", theme: "pink" },
    { id: "regions", label: "Regions", icon: "🗺️", theme: "amber" },
    { id: "darkfiber", label: "Dark Fiber", icon: "⚡", theme: "teal" },

    { id: "converters", label: "Converters", icon: "🔄", theme: "cyan" },
    { id: "help", label: "Help Menu", icon: "❓", theme: "cyan" },
  ];

  const activeTheme =
    CATEGORIES.find((c) => c.id === activeCategory)?.theme || "blue";

  const THEME_STYLES: Record<
    ThemeColor,
    {
      checkbox: string;
      text: string;
      bg: string;
      border: string;
      lightBg: string;
    }
  > = {
    blue: {
      checkbox: "text-blue-600 focus:ring-blue-500 checked:bg-blue-600",
      text: "text-blue-700 dark:text-blue-300",
      bg: "bg-blue-600",
      border: "border-blue-200",
      lightBg:
        "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200",
    },
    purple: {
      checkbox: "text-purple-600 focus:ring-purple-500 checked:bg-purple-600",
      text: "text-purple-700 dark:text-purple-300",
      bg: "bg-purple-600",
      border: "border-purple-200",
      lightBg:
        "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200",
    },
    indigo: {
      checkbox: "text-indigo-600 focus:ring-indigo-500 checked:bg-indigo-600",
      text: "text-indigo-700 dark:text-indigo-300",
      bg: "bg-indigo-600",
      border: "border-indigo-200",
      lightBg:
        "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200",
    },
    green: {
      checkbox: "text-green-600 focus:ring-green-500 checked:bg-green-600",
      text: "text-green-700 dark:text-green-300",
      bg: "bg-green-600",
      border: "border-green-200",
      lightBg:
        "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200",
    },
    emerald: {
      checkbox:
        "text-emerald-600 focus:ring-emerald-500 checked:bg-emerald-600",
      text: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-600",
      border: "border-emerald-200",
      lightBg:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200",
    },
    orange: {
      checkbox: "text-orange-600 focus:ring-orange-500 checked:bg-orange-600",
      text: "text-orange-700 dark:text-orange-300",
      bg: "bg-orange-600",
      border: "border-orange-200",
      lightBg:
        "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200",
    },
    teal: {
      checkbox: "text-teal-600 focus:ring-teal-500 checked:bg-teal-600",
      text: "text-teal-700 dark:text-teal-300",
      bg: "bg-teal-600",
      border: "border-teal-200",
      lightBg:
        "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200",
    },
    red: {
      checkbox: "text-red-600 focus:ring-red-500 checked:bg-red-600",
      text: "text-red-700 dark:text-red-300",
      bg: "bg-red-600",
      border: "border-red-200",
      lightBg: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200",
    },
    pink: {
      checkbox: "text-pink-600 focus:ring-pink-500 checked:bg-pink-600",
      text: "text-pink-700 dark:text-pink-300",
      bg: "bg-pink-600",
      border: "border-pink-200",
      lightBg:
        "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-200",
    },
    cyan: {
      checkbox: "text-cyan-600 focus:ring-cyan-500 checked:bg-cyan-600",
      text: "text-cyan-700 dark:text-cyan-300",
      bg: "bg-cyan-600",
      border: "border-cyan-200",
      lightBg:
        "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200",
    },
    amber: {
      checkbox: "text-amber-600 focus:ring-amber-500 checked:bg-amber-600",
      text: "text-amber-700 dark:text-amber-300",
      bg: "bg-amber-600",
      border: "border-amber-200",
      lightBg:
        "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
    },
  };

  if (isLoading) {
    return (
      <div className="ds-flex-center-py12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // --- Helpers ---
  const isSelected = (code: string) =>
    selectedPermissions.includes(code) || groupPermissions.includes(code);
  const isGroup = (code: string) => groupPermissions.includes(code);

  // --- Auto-Assignment Logic ---
  const handleTogglePermission = (code: string) => {
    // 1. Toggle the target permission
    togglePermission(code);

    // 2. Network Planning Dependency Logic
    // If activating "Infrastructure Items" or any Network Tab, ensure core permissions are active
    const networkTabs = [
      "network:infra:items",
      "network:infra:add",
      "network:recycle_bin",
    ];

    // If currently UNCHECKED (we are about to check it)
    if (!isSelected(code) && networkTabs.includes(code)) {
      // Auto-assign core permissions: View Page, Map, Create Folder, Import
      const corePermissions = [
        "network:view",
        // "network:folder:create", // Removed per user request
        // "network:file:import",   // Removed per user request
      ];

      corePermissions.forEach((p) => {
        if (!selectedPermissions.includes(p)) {
          togglePermission(p);
        }
      });
    }

    // New: Manage Features Group Logic
    if (code === "network:manage_features") {
      const children = [
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
        "network:tools:export",
      ];
      if (!isSelected(code)) {
        // Selecting Parent -> Select All Children
        children.forEach((c) => {
          if (!selectedPermissions.includes(c)) togglePermission(c);
        });
      } else {
        // Deselecting Parent -> Deselect All Children
        children.forEach((c) => {
          if (selectedPermissions.includes(c)) togglePermission(c);
        });
      }
    }

    // 3. Manage Features: Bottom-Up Logic
    const matrixChildren = [
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
      "network:tools:export",
    ];

    // If a child is SELECTED, ensure the Parent (Master Switch) is also SELECTED
    if (!isSelected(code) && matrixChildren.includes(code)) {
      if (!selectedPermissions.includes("network:manage_features")) {
        togglePermission("network:manage_features");
      }
    }

    // Feasibility Dependency Logic
    if (code === "network:feasibility:edit" && !isSelected(code)) {
      if (!selectedPermissions.includes("network:feasibility:view")) {
        togglePermission("network:feasibility:view");
      }
    }
  };

  // Helper to render a checkbox item
  const renderItem = (
    code: string,
    label?: string,
    description?: string,
    indent = false,
  ) => {
    // Attempt to find permission in catalog to fallback for label/desc if not provided
    let permDef: any = null;
    Object.values(catalog).forEach((list) => {
      const found = list.find((p) => p.code === code);
      if (found) permDef = found;
    });

    const finalLabel = label || permDef?.name || code;
    const finalDesc = description || permDef?.description || "Enables core system functionality for this feature module.";

    const styles = THEME_STYLES[activeTheme];

    // Local state needs to be managed via a separate tiny wrapper component to hold hooks per item
    return (
      <PermissionItemRow
        key={code}
        code={code}
        label={finalLabel}
        description={finalDesc}
        indent={indent}
        isSelected={isSelected(code)}
        isGroup={isGroup(code)}
        styles={styles}
        onToggle={() => handleTogglePermission(code)}
        globalShowDetails={showDetailedDocs}
      />
    );
  };

  // --- Folder Filtering Logic ---
  // Strip state/UT children from the tree entirely.
  // Instead, tag parent folders with `regionCount` so the UI can show a badge.
  const filterFoldersByRegion = (folders: any[]): any[] => {
    if (!folders) return [];
    
    return folders.map((folder: any) => {
      const filteredFolder = { ...folder };
      
      if (folder.children && folder.children.length > 0) {
        // Separate state children from non-state children
        const stateChildren: any[] = [];
        const nonStateChildren: any[] = [];
        
        folder.children.forEach((child: any) => {
          const childNameClean = child.name.trim().toLowerCase();
          const isStateFolder = INDIAN_STATES.some(s => s.toLowerCase() === childNameClean);
          if (isStateFolder) {
            stateChildren.push(child);
          } else {
            nonStateChildren.push(child);
          }
        });
        
        // If this folder had state children, tag it with the count of assigned regions
        if (stateChildren.length > 0) {
          filteredFolder.regionCount = assignedRegions.length;
          // Only keep non-state children (recursively filter those too)
          filteredFolder.children = filterFoldersByRegion(nonStateChildren);
        } else {
          // Recursively filter deeper children
          filteredFolder.children = filterFoldersByRegion(folder.children);
        }
      }
      
      return filteredFolder;
    });
  };

  const filteredInfrastructureFolders = filterFoldersByRegion(infrastructureFolders);
  const filteredCustomerFolders = filterFoldersByRegion(customerFolders);
  const filteredOthersFolders = filterFoldersByRegion(othersFolders);

  // --- Render Functions for Folders (Embedded) ---
  const assignedIds = folderAssignments.map((f) => f.folder_id);
  const assignedAddIds = folderAddAssignments.map((f) => f.folder_id);

  const areFoldersSelected = (folders: any[]) => {
    if (!folders || folders.length === 0) return false;
    const allIds: number[] = [];
    const collectIds = (nodes: any[]) => {
      nodes.forEach((n) => {
        allIds.push(n.id);
        if (n.children) collectIds(n.children);
      });
    };
    collectIds(folders);
    return allIds.length > 0 && allIds.every((id) => assignedIds.includes(id));
  };

  const areFoldersAddSelected = (folders: any[]) => {
    if (!folders || folders.length === 0) return false;
    const allIds: number[] = [];
    const collectIds = (nodes: any[]) => {
      nodes.forEach((n) => {
        allIds.push(n.id);
        if (n.children) collectIds(n.children);
      });
    };
    collectIds(folders);
    return allIds.length > 0 && allIds.every((id) => assignedAddIds.includes(id));
  };

  // --- Wrapper for Folder Toggles ---
  const handleCategoryFolderToggle = (folders: any[], checked: boolean) => {
    toggleCategoryFolderAccess(folders, checked);

    if (checked) {
      const corePermissions = [
        "network:view",
        "network:infra:items", 
      ];
      corePermissions.forEach((p) => {
        if (!selectedPermissions.includes(p)) togglePermission(p);
      });
    }
  };

  const handleAddCategoryFolderToggle = (folders: any[], checked: boolean) => {
    toggleCategoryFolderAddAccess(folders, checked);

    if (checked) {
      const corePermissions = [
        "network:view",
        "network:infra:add",
      ];
      corePermissions.forEach((p) => {
        if (!selectedPermissions.includes(p)) togglePermission(p);
      });
    }
  };

  const renderFolderSection = (
    title: string,
    icon: string,
    folders: any[],
    toggleFn: (checked: boolean) => void,
  ) => {
    const allSelected = areFoldersSelected(folders);
    const styles = THEME_STYLES[activeTheme];

    return (
      <div className="ds-folder-section">
        <div className="ds-flex-between-mb2">
          <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center">
            <span className="mr-1.5">{icon}</span> {title}
          </h5>
          <button
            type="button"
            onClick={() => handleCategoryFolderToggle(folders, !allSelected)}
            className={`text-[10px] font-medium underline ${styles.text}`}
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>
        </div>
        {folders.length > 0 ? (
          folders.map((folder) => (
            <FolderAccessTree
              key={folder.id}
              folder={folder}
              assignedFolderIds={assignedIds}
              onToggle={(fid, chk) => {
                toggleFolderAccess(fid, chk);
                if (chk) {
                  // Also enforce core perms on individual folder check
                  const corePermissions = [
                    "network:view",
                    // "network:folder:create",
                    // "network:file:import",
                    "network:infra:items",
                  ];
                  corePermissions.forEach((p) => {
                    if (!selectedPermissions.includes(p)) togglePermission(p);
                  });
                }
              }}
            />
          ))
        ) : (
          <div className="ds-text-empty-italic">No folders</div>
        )}
      </div>
    );
  };

  const renderAddFolderSection = (
    title: string,
    icon: string,
    folders: any[],
    toggleFn: (checked: boolean) => void,
  ) => {
    const allSelected = areFoldersAddSelected(folders);
    const styles = THEME_STYLES[activeTheme];

    return (
      <div className="ds-folder-add-section">
        <div className="ds-flex-between-mb2">
          <h5 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center">
            <span className="mr-1.5">{icon}</span> {title}
          </h5>
          <button
            type="button"
            onClick={() => handleAddCategoryFolderToggle(folders, !allSelected)}
            className={`text-[10px] font-medium underline ${styles.text}`}
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>
        </div>
        {folders.length > 0 ? (
          folders.map((folder) => (
            <FolderAccessTree
              key={folder.id}
              folder={folder}
              assignedFolderIds={assignedAddIds}
              onToggle={(fid, chk) => {
                toggleFolderAddAccess(fid, chk);
                if (chk) {
                  const corePermissions = ["network:view", "network:infra:add"];
                  corePermissions.forEach((p) => {
                    if (!selectedPermissions.includes(p)) togglePermission(p);
                  });
                }
              }}
            />
          ))
        ) : (
          <div className="ds-text-empty-italic">No folders</div>
        )}
      </div>
    );
  };

  // --- Config for Cards ---
  // We manually layout the 8 cards

  // --- Config for Sidebar ---

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case "map":
        return (
          <div className="ds-space-y-4">
            {renderItem(
              "map:view",
              "View Map Tab",
              "Provides core access to view the interactive map, load regions, and see basic boundaries.",
            )}
            {isSelected("map:view") && (
              <div className="mt-4 space-y-3 pl-4 border-l-2 border-blue-100 dark:border-blue-900/30">
                <h6 className="ds-text-heading-sm">
                  Map Tools
                </h6>
                <div className="ds-grid-2col-gap3">
                  {renderItem("map:tools:geometry_suite", "Geometry Suite", "Enables analytical tools including Distance, Polygon, Circle, Elevation, and Sector RF.")}
                  {renderItem("network:feasibility:view", "View Staff Surveys", "Access the site survey sandbox to view customer markers and connection lines.")}
                </div>
                {isSelected("network:feasibility:view") && (
                  <div className="ds-sub-items-amber">
                    {renderItem(
                      "network:feasibility:edit",
                      "Manage Site Surveys",
                      "Full permission to create markers, delete studies, and link Excel survey data to marked locations.",
                      true
                    )}
                    {renderItem(
                      "network:feasibility:markers",
                      "Add / Edit / Delete Markers",
                      "Allows adding new markers on the map, editing marker details, and deleting feasibility studies.",
                      true
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );



      case "network":
        return (
          <div className="ds-grid-lg2col-gap8">
            <div className="ds-space-y-6">
              <div>
                <h6 className="ds-text-heading-md">
                  Core Module Access
                </h6>
                <div className="ds-space-y-4">
                  {renderItem(
                    "network:view",
                    "View Network Planning",
                    "Grants foundational access to open the Network Planning module and view its top-level UI.",
                  )}
                </div>
              </div>

              <div>
                <h6 className="ds-text-heading-md">
                  Primary Navigation Tabs
                </h6>
                <div className="space-y-5">
                  {/* Tab 1: Infrastructure Items */}
                  <div className="space-y-2">
                    {renderItem(
                      "network:infra:items",
                      "Tab 1: Infrastructure Items",
                      "Unlocks the folder hierarchy and file browser. Required to view Customer and Infrastructure data.",
                    )}
                  </div>

                  {/* Tab 2: Add New Inventory */}
                  <div className="space-y-2">
                    {renderItem(
                      "network:infra:add",
                      "Tab 2: Add New Inventory",
                      "Allows clicking on the map to drop new nodes, poles, trenches, or splice closures into the system.",
                    )}
                  </div>

                  {/* Tab 3: Approvals */}
                  <div className="space-y-2">
                    <div className="ds-flex-gap2-mb1">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight">Tab 3: Approvals Workflow</span>
                    </div>
                    {renderItem(
                      "network:infra:approve",
                      "Approval Dashboard (BM Workflow)",
                      "Provides access to the Branch Manager Dashboard for auditing, approving, or rejecting infrastructure requests."
                    )}
                    {isSelected("network:infra:approve") && (
                      <div className="ds-sub-items-indigo">
                        {renderItem(
                          "network:infra:delete_approval_history",
                          "Delete Approval History",
                          "Allows branch managers/admins to hard-delete audit records directly from the Approval History.",
                          true
                        )}
                      </div>
                    )}
                    {renderItem(
                      "network:infra:submissions",
                      "My Submissions Tab (PM Workflow)",
                      "Allows the user (PM) to track and resubmit their own infrastructure registration requests."
                    )}
                    {isSelected("network:infra:submissions") && (
                      <div className="ds-sub-items-indigo">
                        {renderItem(
                          "network:infra:delete",
                          "Cancel Request",
                          "Grants the power to cancel pending or planned infrastructure submission records.",
                          true
                        )}
                        {renderItem(
                          "network:infra:delete_submission_history",
                          "Delete Submission History",
                          "Allows the user to clear out their own historical requests from the My Submissions panel.",
                          true
                        )}
                      </div>
                    )}
                  </div>


                  {/* Tab 5: Recycle Bin */}
                  <div className="space-y-2">
                    {renderItem(
                      "network:recycle_bin",
                      "Tab 5: View Recycle Bin",
                      "Grants access to the Network Recycle Bin to view soft-deleted files and folders."
                    )}
                    {isSelected("network:recycle_bin") && (
                      <div className="ds-sub-items-red">
                        {renderItem(
                          "network:recycle:restore",
                          "Restore Items",
                          "Allows resurrecting accidentally deleted folders or infra files back into the active database.",
                          true,
                        )}
                        {renderItem(
                          "network:recycle:delete",
                          "Permanently Delete",
                          "Destructive: Purges files from the trash bin permanently. Bypasses recovery.",
                          true,
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h6 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 mb-4 mt-4">
                  Advanced Folder & Data Management
                </h6>
                <div className="ds-space-y-4">
                  <div className="ds-grid-2col-gap3">
                    {renderItem("network:folder:create", "Create New Folders", "Can spawn new directory structures.")}
                    {renderItem("network:file:import", "Import Files", "Permits uploading external KML/KMZ or bulk excel files.")}
                  </div>
                  
                  {renderItem("network:folder:rename", "Rename Folders", "Allows renaming existing infrastructure and customer folders.")}
                  {renderItem("network:folder:delete", "Delete Folders", "Allows deleting user-created folders and all their contents.")}

                  <div className="my-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                    {renderItem(
                      "network:manage_features",
                      "Manage Feature Data (Matrix)",
                      "Global switch that enables individual data manipulation tools within the file browser.",
                    )}
                    <div className="ml-6 mt-4 space-y-8 pb-4">
                      {/* Planned Data Group */}
                      <div className="ds-group-card-amber">
                        <div className="ds-flex-between-mb2">
                          <h6 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Planned Infrastructure
                          </h6>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-amber-500 transition-colors uppercase tracking-tighter">Select Group</span>
                            <input 
                              type="checkbox" 
                              className="w-3.5 h-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-500 transition-all cursor-pointer"
                              checked={PLANNED_GROUP.every(id => selectedPermissions.includes(id))}
                              onChange={(e) => togglePermissionGroup(PLANNED_GROUP, e.target.checked)}
                            />
                          </label>
                        </div>
                        <div className="ds-grid-2col-gap3">
                          {renderItem("network:file:edit_planned", "Edit Planned Data (Form)", "Modify submissions via modal.", true)}
                          {renderItem("network:file:live_edit_planned", "Live Edit Planned Data (In-line)", "Directly edit cells in table.", true)}
                          {renderItem("network:file:delete_file_planned", "Delete Planned File (Modal)", "Remove entire data file.", true)}
                          {renderItem("network:file:delete_feature_planned", "Delete Planned Feature (Grid)", "Remove single rows.", true)}
                        </div>
                      </div>
                      
                      {/* Live Data Group */}
                      <div className="ds-group-card-blue">
                        <div className="ds-flex-between-mb2">
                          <h6 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Live Inventory
                          </h6>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500 transition-colors uppercase tracking-tighter">Select Group</span>
                            <input 
                              type="checkbox" 
                              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 transition-all cursor-pointer"
                              checked={LIVE_GROUP.every(id => selectedPermissions.includes(id))}
                              onChange={(e) => togglePermissionGroup(LIVE_GROUP, e.target.checked)}
                            />
                          </label>
                        </div>
                        <div className="ds-grid-2col-gap3">
                          {renderItem("network:file:edit_live", "Edit Live Data (Form)", "Modify active infra via modal.", true)}
                          {renderItem("network:file:live_edit_live", "Live Edit Live Data (In-line)", "Directly edit cells in table.", true)}
                          {renderItem("network:file:delete_file_live", "Delete Live File (Modal)", "Remove entire data file.", true)}
                          {renderItem("network:file:delete_feature_live", "Delete Live Feature (Grid)", "Remove single rows.", true)}
                        </div>
                      </div>

                      {/* Imported Data Group */}
                      <div className="space-y-3 p-4 bg-green-50/20 dark:bg-green-900/5 rounded-xl border border-green-100/50 dark:border-green-900/20">
                        <div className="ds-flex-between-mb2">
                          <h6 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Imported Files (KML/KMZ)
                          </h6>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-green-500 transition-colors uppercase tracking-tighter">Select Group</span>
                            <input 
                              type="checkbox" 
                              className="w-3.5 h-3.5 rounded border-gray-300 text-green-500 focus:ring-green-500 transition-all cursor-pointer"
                              checked={IMPORTED_GROUP.every(id => selectedPermissions.includes(id))}
                              onChange={(e) => togglePermissionGroup(IMPORTED_GROUP, e.target.checked)}
                            />
                          </label>
                        </div>
                        <div className="ds-grid-2col-gap3">
                          {renderItem("network:file:edit_imported", "Edit Imported Data (Form)", "Modify raw datasets via modal.", true)}
                          {renderItem("network:file:live_edit_imported", "Live Edit Imported Data (In-line)", "Directly edit cells in table.", true)}
                          {renderItem("network:file:delete_file_imported", "Delete Imported File (Modal)", "Remove entire data file.", true)}
                          {renderItem("network:file:delete_feature_imported", "Delete Imported Feature (Grid)", "Remove single rows.", true)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h6 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                       Network Tools
                    </h6>
                    {renderItem(
                      "network:tools:export",
                      "Export Data Tool",
                      "Allows scraping the active map nodes and compiling them into CSV/JSON/KML exports.",
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="ds-space-y-4">
              {/* Show Folder Access column ONLY if Infra Items is selected */}
              {isSelected("network:infra:items") ? (
                <>
                  <h6 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                    Folder Access
                  </h6>
                  <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700 h-full max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {renderFolderSection(
                      "Infrastructure",
                      "🏢",
                      filteredInfrastructureFolders,
                      (c) =>
                        toggleCategoryFolderAccess(filteredInfrastructureFolders, c),
                    )}
                    <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>
                    {renderFolderSection(
                      "Customers",
                      "👥",
                      filteredCustomerFolders,
                      (c) => toggleCategoryFolderAccess(filteredCustomerFolders, c),
                    )}
                    <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>
                    {renderFolderSection(
                      "Others",
                      "📁",
                      filteredOthersFolders,
                      (c) => toggleCategoryFolderAccess(filteredOthersFolders, c),
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic bg-gray-50 dark:bg-gray-900/10 rounded-xl border border-dashed border-gray-200 p-8">
                  Select "View Infrastructure Items" to configure folders
                </div>
              )}

              {/* Show Add Folder Access column ONLY if Infra Add is selected */}
              {isSelected("network:infra:add") ? (
                <>
                  <h6 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b pb-2 mt-8">
                    Add New Inventory Allowed Folders
                  </h6>
                  <div className="bg-indigo-50/10 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/50 h-full max-h-[40vh] overflow-y-auto custom-scrollbar">
                    {renderAddFolderSection(
                      "Infrastructure",
                      "🏢",
                      filteredInfrastructureFolders,
                      (c) => toggleCategoryFolderAddAccess(filteredInfrastructureFolders, c),
                    )}
                    <div className="my-4 border-t border-indigo-200 dark:border-indigo-800"></div>
                    {renderAddFolderSection(
                      "Customers",
                      "👥",
                      filteredCustomerFolders,
                      (c) => toggleCategoryFolderAddAccess(filteredCustomerFolders, c),
                    )}
                    <div className="my-4 border-t border-indigo-200 dark:border-indigo-800"></div>
                    {renderAddFolderSection(
                      "Others",
                      "📁",
                      filteredOthersFolders,
                      (c) => toggleCategoryFolderAddAccess(filteredOthersFolders, c),
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-8 flex items-center justify-center p-4 text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-900/10 rounded-xl border border-dashed border-gray-200">
                  Select "Add New Inventory" to configure write-allowed folders
                </div>
              )}
            </div>
          </div>
        );

      case "dashboard":
        return (
          <div className="ds-space-y-4">
            {renderItem("dashboard:view", "View Dashboard", "Grants access to the main administrative dashboard, overview statistics, and high-level platform health metrics.")}
          </div>
        );

      case "users":
        return (
          <div className="ds-space-y-4">
            {renderItem("users:view", "View Users", "Allows the user to view the enterprise user directory and read basic profiles.")}
            {isSelected("users:view") && (
              <div className="ml-6 mt-2 space-y-2">
                {renderItem("users:create", "Create Users", "Permits manual creation of new user profiles into the system.")}
                {renderItem("users:edit", "Edit Users", "Allows modification of user details like name, email, phone, and profile data.")}
                {renderItem(
                  "users:delete",
                  "Delete Users",
                  "Permits permanent deletion or deactivation of user accounts.",
                )}
                <div className="border-t border-gray-100 dark:border-gray-700 my-2 pt-2">
                  <h6 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Advanced Actions
                  </h6>
                  {renderItem(
                    "users:manage_permissions",
                    "Manage Permissions",
                    "Critical: Grants the ability to assign roles, change access groups, and modify deep permissions for other users.",
                  )}
                  {renderItem(
                    "users:reset_password",
                    "Reset Password",
                    "Permits triggering a manual password reset sequence or temporarily overwriting a user's password.",
                  )}
                  {renderItem(
                    "users:manage_security",
                    "Manage Security",
                    "Permits managing 2FA settings, forcing email verifications, and viewing user security logs.",
                  )}
                  {renderItem(
                    "users:import",
                    "Import Users",
                    "Permits uploading an Excel CSV to bulk-create hundreds of users at once.",
                  )}
                  {renderItem(
                    "users:export",
                    "Export Users",
                    "Permits downloading the entire enterprise user directory to an external CSV file.",
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "groups":
        return (
          <div className="ds-space-y-4">
            {renderItem("groups:view", "View Groups", "Grants read-only access to view existing security groups and their active members.")}
            {isSelected("groups:view") && (
              <div className="ml-6 mt-2 space-y-2">
                {renderItem("groups:create", "Create Groups", "Allows creating entirely new operational groups and teams.")}
                {renderItem("groups:edit", "Edit Groups", "Permits renaming groups and managing user memberships within those groups.")}
                {renderItem("groups:delete", "Delete Groups", "Permits dissolving operational groups entirely (does NOT delete users).")}
              </div>
            )}
          </div>
        );

      case "admin":
        return (
          <div className="ds-space-y-4">
            {renderItem("admin:view", "View Admin Tab", "Grants access to the administrative configuration portal.")}
            {isSelected("admin:view") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-red-100 dark:border-red-900/30">
                {renderItem("admin:audit_logs", "Audit Logs", "Allows viewing system-wide activity logs, logins, and data manipulations.")}
                {isSelected("admin:audit_logs") && (
                  <div className="col-span-1 md:col-span-2 ml-4 space-y-2 mt-2">
                    {/* These might not be in DB catalog, keep if needed or move to catalog */}
                    {renderItem(
                      "admin:audit_logs:export",
                      "Export CSV",
                      "Permits exporting the entire security audit log as a CSV for external compliance.",
                      true,
                    )}
                    {renderItem(
                      "admin:audit_logs:clear",
                      "Clear All Logs",
                      "Dangerous: Grants ability to irreversibly purge all historical audit logs.",
                      true,
                    )}
                  </div>
                )}
                {renderItem("admin:region_request", "Region Request", "Allows processing and approving territory reassignment requests.")}
                {renderItem("admin:bulk_assignment", "Bulk Assignment", "Permits applying policy overrides to massive batches of users simultaneously.")}
                {renderItem("admin:temp_access", "Temporary Access", "Permits generating time-limited access tokens for external contractors.")}
                {renderItem("admin:export_reports", "Export Reports", "Allows generating unified compliance and operations reports.")}
                {renderItem("admin:password_reset", "Global Password Reset", "Permits invalidating tokens and forcing a platform-wide password reset.")}
                {renderItem("admin:role_builder", "Role Builder", "Critical: Grants full control to define new security roles, assign toggles, and bypass defaults.")}
                {renderItem("admin:region_boundaries", "Region Boundaries", "Permits editing the core geospatial boundary logic and drawing new administrative zones.")}
                {renderItem("admin:database", "Database Backup", "Allows triggering automated or manual PostgreSQL database snapshot backups.")}
                {isSelected("admin:database") && (
                  <div className="ml-6 mt-2 space-y-2">
                    {renderItem("admin:database:export", "Targeted Export", "Query and export specific core system tables to spreadsheets.", true)}
                  </div>
                )}
                {renderItem("data:export", "Data Export", "Grants high-level ability to export backend application tables to Excel.", false)}
              </div>
            )}
          </div>
        );

      case "analytics":
        return (
          <div className="ds-space-y-4">
            {renderItem("analytics:view", "View Analytics", "Grants access to read the high-volume traffic charts, user metrics, and usage telemetry.")}
          </div>
        );

      case "converters":
        return (
          <div className="ds-space-y-4">
            {renderItem("converter:view", "View Converters Tab", "Unlocks the data translation interface.")}
            {isSelected("converter:view") && (
              <div className="ml-6 mt-2 space-y-2">
                {renderItem(
                  "converter:excel_to_kml",
                  "Excel to KML Tool",
                  "Provides dedicated access to the Excel > KML/KMZ geospatial conversion engine pipeline.",
                )}

              </div>
            )}
          </div>
        );


      case "help":
        return (
            <div className="ds-space-y-4">
                 <h6 className="ds-text-heading-md">
                    Schema & API Documentation
                 </h6>
                {renderItem("system:schema:view", "View Database Schema", "Grants read-only access to browse the interactive PostgreSQL schema visualizer.")}
                {isSelected("system:schema:view") && (
                    <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-4 py-2">
                         {renderItem("system:schema:export:pdf", "Export Schema PDF", "Allows downloading a compiled PDF document of the data models.")}
                         {renderItem("system:schema:export:image", "Export Schema Image", "Allows rendering and saving high-resolution ER diagram png images.")}
                         {renderItem("system:schema:annotate", "Annotate Schema", "Permits saving custom architectural notes and column descriptions to the schema viewer.")}
                         {renderItem("system:schema:query", "Run SQL Queries", "Allows developers to execute read-only exploratory raw SQL queries inside the application.")}
                         {renderItem("system:schema:erd", "Global ER Diagram", "Allows viewing the interactive visual Entity-Relationship diagram maps of the database.")}
                    </div>
                )}

                <div className="my-4 border-t border-gray-100 dark:border-gray-700"></div>

                {renderItem("system:api:view", "View API Documentation", "Grants access to the embedded Swagger/OpenAPI documentation for developer integration.")}
                 {isSelected("system:api:view") && (
                    <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-4 py-2">
                        {renderItem("system:api:export", "Export API PDF", "Permits compiling the entire API specification into an offline PDF manual.")}
                         {renderItem("system:api:edit", "Edit API Docs", "Allows modifying endpoint descriptions, payload signatures, and adding examples.")}
                    </div>
                )}

                <div className="my-4 border-t border-gray-100 dark:border-gray-700"></div>

                {renderItem("system:architecture:view", "View Server Architecture", "Grants access to the interactive server deployment and operations map.")}
            </div>
        );

      case "regions":
        return (
          <div>
            <RegionSelector
              selectedRegions={assignedRegions}
              onChange={setAssignedRegions}
            />
          </div>
        );

      case "darkfiber":
        return (
          <div className="ds-space-y-4">
            <h6 className="ds-text-heading-md">
              Module Redesign Access
            </h6>
            {renderItem(
              "darkfiber:view",
              "View Dark Fiber Tab",
              "Allows the user to see the Dark Fiber navigation tab and access the placeholder page during the current module redesign phase."
            )}
          </div>
        );

      default:
        return <div>Select a category</div>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-b-xl overflow-hidden">
      {/* Tabs removed */}

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden h-full min-h-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              const allVisible = Object.values(VISIBLE_PERMISSIONS).flat();
              
              // Check if ALL visible permissions are essentially "Checkmarked" (Direct OR Inherited)
              const isAllSelected = allVisible.every((p) =>
                selectedPermissions.includes(p) || groupPermissions.includes(p)
              );

              if (isAllSelected) {
                // Deselect All
                // Only remove Direct permissions. Ignore Inherited.
                allVisible.forEach((p) => {
                  if (selectedPermissions.includes(p)) togglePermission(p);
                });
                setAssignedRegions([]);
              } else {
                // Select All
                // Only toggle ON permissions that are completely missing (neither Direct nor Inherited)
                allVisible.forEach((p) => {
                  const isActive = selectedPermissions.includes(p) || groupPermissions.includes(p);
                  if (!isActive) togglePermission(p);
                });
                setAssignedRegions(INDIAN_STATES);
              }
            }}
            className="w-full py-2 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {Object.values(VISIBLE_PERMISSIONS)
              .flat()
              .every((p) => selectedPermissions.includes(p) || groupPermissions.includes(p))
              ? "Deselect Everything"
              : "Global Select All"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar min-h-0">

          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            Categories
          </h4>
          <nav className="space-y-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const themeStyle = THEME_STYLES[cat.theme];

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? themeStyle.lightBg
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="mr-3 text-lg">{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header for Active Category */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <span className="text-2xl mr-3">
              {CATEGORIES.find((c) => c.id === activeCategory)?.icon}
            </span>
            <h2
              className={`text-xl font-bold ${THEME_STYLES[activeTheme].text}`}
            >
              {CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              // Use VISIBLE_PERMISSIONS for accurate category toggle
              const catPerms =
                VISIBLE_PERMISSIONS[
                  activeCategory as keyof typeof VISIBLE_PERMISSIONS
                ] || [];
              
              // Check if ALL visible permissions in this category are essentially "Checkmarked" (Direct OR Inherited)
              const isAllSelected = catPerms.every((p) =>
                selectedPermissions.includes(p) || groupPermissions.includes(p)
              );

              if (isAllSelected) {
                // Deselect All in Category
                // Logic: We only want to toggle (remove) permissions that are explicitly DIRECT.
                // We CANNOT touch Inherited ones without triggering detachment.
                catPerms.forEach((p) => {
                  if (selectedPermissions.includes(p)) togglePermission(p);
                });
              } else {
                // Select All in Category
                // Logic: We only activate permissions that are NOT currently active (neither Direct nor Inherited).
                catPerms.forEach((p) => {
                  const isActive = selectedPermissions.includes(p) || groupPermissions.includes(p);
                  if (!isActive) togglePermission(p);
                });
              }
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-transparent hover:border-current bg-gray-50 dark:bg-gray-800 ${THEME_STYLES[activeTheme].text}`}
          >
            {(
              VISIBLE_PERMISSIONS[
                activeCategory as keyof typeof VISIBLE_PERMISSIONS
              ] || []
            ).every((p) => selectedPermissions.includes(p) || groupPermissions.includes(p))
              ? "Deselect All in "
              : "Select All in "}
            {CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-8">
          {renderCategoryContent()}
        </div>
      </div>
    </div>
    </div>
  );
};

// --- Sub-components ---

interface PermissionItemRowProps {
  code: string;
  label: string;
  description: string;
  indent: boolean;
  isSelected: boolean;
  isGroup: boolean;
  styles: any;
  onToggle: () => void;
  globalShowDetails: boolean;
}

const PermissionItemRow: React.FC<PermissionItemRowProps> = ({
  code,
  label,
  description,
  indent,
  isSelected,
  isGroup,
  styles,
  onToggle,
  globalShowDetails,
}) => {
  const [localShowDetails, setLocalShowDetails] = useState(false);

  // The item shows details if EITHER the global toggle is ON or the local toggle is ON
  const showDetails = globalShowDetails || localShowDetails;

  return (
    <div
      className={`relative flex flex-col p-2 rounded-md transition-all ${indent ? "ml-6" : ""} ${
        isSelected
          ? `bg-gray-50/50 dark:bg-gray-800/10 border ${styles.border} dark:border-opacity-30`
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
      }`}
    >
      <div className="flex items-start">
        <label
          htmlFor={`perm-${code}`}
          className="relative flex items-center justify-center h-5 w-5 mt-0.5 cursor-pointer"
        >
          {/* Hidden Input for Form Logic */}
          <input
            id={`perm-${code}`}
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          />
          {/* Custom Visual Checkbox */}
          <div
            className={`flex items-center justify-center h-5 w-5 rounded border-2 transition-colors ${
              isSelected
                ? "bg-blue-600 border-blue-600"
                : "bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500"
            }`}
          >
            {isSelected && (
              <svg
                className="w-3.5 h-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </label>

        <div className="ml-3 flex-1 min-w-0 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label
              htmlFor={`perm-${code}`}
              className={`text-sm font-medium cursor-pointer ${
                isSelected ? styles.text : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {label}
            </label>

            {/* Local Doc Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setLocalShowDetails(!localShowDetails);
              }}
              className={`ml-1 focus:outline-none transition-colors ${
                showDetails
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
              title="Toggle Description"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showDetails ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </button>
          </div>

          <div className="flex items-center">
            {isGroup && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 whitespace-nowrap">
                Inherited
              </span>
            )}
            {!isGroup && isSelected && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 whitespace-nowrap">
                Direct
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Accordion Documentation Detail Block */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-8"
          >
            <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg shadow-sm">
              <div className="flex gap-2">
                <div className="shrink-0 text-blue-500 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    System Permission: <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded text-[10px] text-gray-500">{code}</code>
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserPermissionsDialogContent;
