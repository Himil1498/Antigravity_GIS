import React, { useState, useMemo, useCallback } from "react";
import { VISIBLE_PERMISSIONS } from "./permissionConfig";
import { PermissionCatalog, FolderAccessAssignment } from "../../../../services/userPermissionApiService";
import RegionSelector from "../RegionSelector/index";
import { INDIAN_STATES } from "../../constants/indianStates";
import { PermissionCategoryNav, CategoryConfig } from "./PermissionCategoryNav";
import { PermissionItemRow } from "./PermissionItemRow";
import { PermissionFolderSection } from "./PermissionFolderSection";

interface UserPermissionsDialogContentProps {
  isLoading: boolean;
  activeTab: "permissions" | "folders";
  setActiveTab: (tab: "permissions" | "folders") => void;
  catalog: PermissionCatalog;
  selectedPermissions: string[];
  groupPermissions: string[];
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

const CATEGORIES: CategoryConfig[] = [
  { id: "map", label: "Map", icon: "🗺️" },
  { id: "network", label: "Network Planning", icon: "🌐" },
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "users", label: "Users", icon: "👤" },
  { id: "admin", label: "Admin", icon: "🛡️" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "regions", label: "Regions", icon: "🗺️" },
  { id: "darkfiber", label: "Dark Fiber", icon: "⚡" },
  { id: "converters", label: "Converters", icon: "🔄" },
  { id: "help", label: "Help Menu", icon: "❓" },
];

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

const UserPermissionsDialogContent: React.FC<UserPermissionsDialogContentProps> = ({
  isLoading,
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
  toggleFolderAccess,
  toggleCategoryFolderAccess,
  toggleFolderAddAccess,
  toggleCategoryFolderAddAccess,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("map");
  const [showDetailedDocs, setShowDetailedDocs] = useState<boolean>(false);

  const isSelected = (code: string) =>
    selectedPermissions.includes(code) || groupPermissions.includes(code);
  const isGroup = (code: string) => groupPermissions.includes(code);

  const handleTogglePermission = (code: string) => {
    togglePermission(code);

    const networkTabs = ["network:infra:items", "network:infra:add", "network:recycle_bin"];
    if (!isSelected(code) && networkTabs.includes(code)) {
      const corePermissions = ["network:view"];
      corePermissions.forEach((p) => {
        if (!selectedPermissions.includes(p)) togglePermission(p);
      });
    }

    if (code === "network:manage_features") {
      const children = [
        ...PLANNED_GROUP,
        ...LIVE_GROUP,
        ...IMPORTED_GROUP,
        "network:tools:export",
      ];
      if (!isSelected(code)) {
        children.forEach((c) => {
          if (!selectedPermissions.includes(c)) togglePermission(c);
        });
      } else {
        children.forEach((c) => {
          if (selectedPermissions.includes(c)) togglePermission(c);
        });
      }
    }

    const matrixChildren = [
      ...PLANNED_GROUP,
      ...LIVE_GROUP,
      ...IMPORTED_GROUP,
      "network:tools:export",
    ];
    if (!isSelected(code) && matrixChildren.includes(code)) {
      if (!selectedPermissions.includes("network:manage_features")) {
        togglePermission("network:manage_features");
      }
    }

    if (code === "network:feasibility:edit" && !isSelected(code)) {
      if (!selectedPermissions.includes("network:feasibility:view")) {
        togglePermission("network:feasibility:view");
      }
    }
  };

  const renderItem = (code: string, label?: string, description?: string, indent = false) => {
    let permDef: any = null;
    Object.values(catalog).forEach((list) => {
      const found = list.find((p) => p.code === code);
      if (found) permDef = found;
    });

    const finalLabel = label || permDef?.name || code;
    const finalDesc = description || permDef?.description || "Enables core system functionality.";

    return (
      <PermissionItemRow
        key={code}
        code={code}
        label={finalLabel}
        description={finalDesc}
        indent={indent}
        isSelected={isSelected(code)}
        isGroup={isGroup(code)}
        onToggle={() => handleTogglePermission(code)}
        globalShowDetails={showDetailedDocs}
      />
    );
  };

  const filterFoldersByRegion = (folders: any[]): any[] => {
    if (!folders) return [];
    return folders.map((folder: any) => {
      const filteredFolder = { ...folder };
      if (folder.children && folder.children.length > 0) {
        const stateChildren: any[] = [];
        const nonStateChildren: any[] = [];
        folder.children.forEach((child: any) => {
          const isStateFolder = INDIAN_STATES.some(s => s.toLowerCase() === child.name.trim().toLowerCase());
          if (isStateFolder) stateChildren.push(child);
          else nonStateChildren.push(child);
        });
        if (stateChildren.length > 0) {
          filteredFolder.regionCount = assignedRegions.length;
          filteredFolder.children = filterFoldersByRegion(nonStateChildren);
        } else {
          filteredFolder.children = filterFoldersByRegion(folder.children);
        }
      }
      return filteredFolder;
    });
  };

  const filteredInfrastructureFolders = useMemo(() => filterFoldersByRegion(infrastructureFolders), [infrastructureFolders, assignedRegions]);
  const filteredCustomerFolders = useMemo(() => filterFoldersByRegion(customerFolders), [customerFolders, assignedRegions]);
  const filteredOthersFolders = useMemo(() => filterFoldersByRegion(othersFolders), [othersFolders, assignedRegions]);

  const assignedIds = useMemo(() => folderAssignments.map((f) => f.folder_id), [folderAssignments]);
  const assignedAddIds = useMemo(() => folderAddAssignments.map((f) => f.folder_id), [folderAddAssignments]);

  if (isLoading) {
    return (
      <div className="ds-flex-center-py12">
        <div className="ds-spinner"></div>
        <p className="ds-text-muted">Loading...</p>
      </div>
    );
  }

  const handleCategoryFolderToggle = (folders: any[], checked: boolean) => {
    toggleCategoryFolderAccess(folders, checked);
    if (checked) {
      ["network:view", "network:infra:items"].forEach((p) => {
        if (!selectedPermissions.includes(p)) togglePermission(p);
      });
    }
  };

  const handleAddCategoryFolderToggle = (folders: any[], checked: boolean) => {
    toggleCategoryFolderAddAccess(folders, checked);
    if (checked) {
      ["network:view", "network:infra:add"].forEach((p) => {
        if (!selectedPermissions.includes(p)) togglePermission(p);
      });
    }
  };

  const handleGlobalToggle = () => {
    const allVisible = Object.values(VISIBLE_PERMISSIONS).flat();
    const isAllSelected = allVisible.every((p) =>
      selectedPermissions.includes(p) || groupPermissions.includes(p)
    );
    if (isAllSelected) {
      allVisible.forEach((p) => {
        if (selectedPermissions.includes(p)) togglePermission(p);
      });
      setAssignedRegions([]);
    } else {
      allVisible.forEach((p) => {
        if (!selectedPermissions.includes(p) && !groupPermissions.includes(p)) togglePermission(p);
      });
      setAssignedRegions(INDIAN_STATES);
    }
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case "map":
        return (
          <div className="ds-space-y-4">
            {renderItem("map:view", "View Map Tab", "Provides core access to view the interactive map.")}
            {isSelected("map:view") && (
              <div className="pg-item-row indent ds-sub-items-blue">
                <h6 className="ds-text-heading-sm">Map Tools</h6>
                <div className="ds-grid-2col-gap3">
                  {renderItem("map:tools:geometry_suite", "Geometry Suite", "Enables analytical tools.")}
                  {renderItem("network:feasibility:view", "View Staff Surveys", "Access site survey sandbox.")}
                </div>
                {isSelected("network:feasibility:view") && (
                  <div className="ds-sub-items-amber">
                    {renderItem("network:feasibility:edit", "Manage Site Surveys", "Full permission to manage surveys.", true)}
                    {renderItem("network:feasibility:markers", "Add/Edit Markers", "Allows adding markers.", true)}
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
                <h6 className="ds-text-heading-md">Core Module Access</h6>
                {renderItem("network:view", "View Network Planning", "Grants foundational access.")}
              </div>
              <div>
                <h6 className="ds-text-heading-md">Primary Navigation Tabs</h6>
                <div className="ds-space-y-4">
                  {renderItem("network:infra:items", "Tab 1: Infrastructure Items", "Unlocks folder hierarchy.")}
                  {renderItem("network:infra:add", "Tab 2: Add New Inventory", "Drop new nodes.")}
                  <div className="ds-sub-items-indigo">
                    {renderItem("network:infra:approve", "Approval Dashboard", "Branch Manager Dashboard.")}
                    {isSelected("network:infra:approve") && renderItem("network:infra:delete_approval_history", "Delete Approval History", "", true)}
                    {renderItem("network:infra:submissions", "My Submissions Tab", "User tracking.")}
                    {isSelected("network:infra:submissions") && (
                      <div className="ds-sub-items-indigo">
                        {renderItem("network:infra:delete", "Cancel Request", "", true)}
                        {renderItem("network:infra:delete_submission_history", "Delete History", "", true)}
                      </div>
                    )}
                  </div>
                  {renderItem("network:recycle_bin", "Tab 5: View Recycle Bin", "View deleted files.")}
                  {isSelected("network:recycle_bin") && (
                    <div className="ds-sub-items-red">
                      {renderItem("network:recycle:restore", "Restore Items", "", true)}
                      {renderItem("network:recycle:delete", "Permanently Delete", "", true)}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h6 className="ds-text-heading-md mt-4">Advanced Folder & Data Management</h6>
                <div className="ds-space-y-4">
                  <div className="ds-grid-2col-gap3">
                    {renderItem("network:folder:create", "Create New Folders", "")}
                    {renderItem("network:file:import", "Import Files", "")}
                  </div>
                  {renderItem("network:folder:rename", "Rename Folders", "")}
                  {renderItem("network:folder:delete", "Delete Folders", "")}
                  <div className="my-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {renderItem("network:manage_features", "Manage Feature Data (Matrix)", "Global switch for file browser tools.")}
                    <div className="ml-6 mt-4 ds-space-y-6">
                      <div className="ds-group-card-amber">
                        <div className="ds-flex-between-mb2">
                          <h6 className="ds-text-heading-sm">Planned Infrastructure</h6>
                          <label className="pg-item-label-group">
                            <span className="pg-item-label">Select Group</span>
                            <input 
                              type="checkbox" 
                              checked={PLANNED_GROUP.every(id => selectedPermissions.includes(id))}
                              onChange={(e) => togglePermissionGroup(PLANNED_GROUP, e.target.checked)}
                              className="pg-checkbox-visual"
                            />
                          </label>
                        </div>
                        <div className="ds-grid-2col-gap3">
                          {renderItem("network:file:edit_planned", "Edit Planned Data", "", true)}
                          {renderItem("network:file:live_edit_planned", "Live Edit Planned", "", true)}
                          {renderItem("network:file:delete_file_planned", "Delete Planned File", "", true)}
                          {renderItem("network:file:delete_feature_planned", "Delete Planned Feature", "", true)}
                        </div>
                      </div>
                      <div className="ds-group-card-blue">
                        <div className="ds-flex-between-mb2">
                          <h6 className="ds-text-heading-sm">Live Inventory</h6>
                          <label className="pg-item-label-group">
                            <span className="pg-item-label">Select Group</span>
                            <input 
                              type="checkbox" 
                              checked={LIVE_GROUP.every(id => selectedPermissions.includes(id))}
                              onChange={(e) => togglePermissionGroup(LIVE_GROUP, e.target.checked)}
                              className="pg-checkbox-visual"
                            />
                          </label>
                        </div>
                        <div className="ds-grid-2col-gap3">
                          {renderItem("network:file:edit_live", "Edit Live Data", "", true)}
                          {renderItem("network:file:live_edit_live", "Live Edit Live", "", true)}
                          {renderItem("network:file:delete_file_live", "Delete Live File", "", true)}
                          {renderItem("network:file:delete_feature_live", "Delete Live Feature", "", true)}
                        </div>
                      </div>
                      <div className="ds-group-card-amber">
                        <div className="ds-flex-between-mb2">
                          <h6 className="ds-text-heading-sm">Imported Files</h6>
                          <label className="pg-item-label-group">
                            <span className="pg-item-label">Select Group</span>
                            <input 
                              type="checkbox" 
                              checked={IMPORTED_GROUP.every(id => selectedPermissions.includes(id))}
                              onChange={(e) => togglePermissionGroup(IMPORTED_GROUP, e.target.checked)}
                              className="pg-checkbox-visual"
                            />
                          </label>
                        </div>
                        <div className="ds-grid-2col-gap3">
                          {renderItem("network:file:edit_imported", "Edit Imported Data", "", true)}
                          {renderItem("network:file:live_edit_imported", "Live Edit Imported", "", true)}
                          {renderItem("network:file:delete_file_imported", "Delete Imported File", "", true)}
                          {renderItem("network:file:delete_feature_imported", "Delete Imported Feature", "", true)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ds-group-card-blue">
                    <h6 className="ds-text-heading-sm mb-2">Network Tools</h6>
                    {renderItem("network:tools:export", "Export Data Tool", "Allows exporting visible data.")}
                  </div>
                </div>
              </div>
            </div>

            <div className="ds-space-y-4">
              {isSelected("network:infra:items") ? (
                <>
                  <h6 className="ds-text-heading-md">Folder Access</h6>
                  <PermissionFolderSection 
                    title="Infrastructure" icon="🏢" folders={filteredInfrastructureFolders} assignedFolderIds={assignedIds} onToggleAll={handleCategoryFolderToggle} onToggleSingle={(fid, chk) => {
                      toggleFolderAccess(fid, chk);
                      if(chk) ["network:view", "network:infra:items"].forEach(p => { if (!selectedPermissions.includes(p)) togglePermission(p); });
                    }} 
                  />
                  <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>
                  <PermissionFolderSection 
                    title="Customers" icon="👥" folders={filteredCustomerFolders} assignedFolderIds={assignedIds} onToggleAll={handleCategoryFolderToggle} onToggleSingle={(fid, chk) => { toggleFolderAccess(fid, chk); }} 
                  />
                  <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>
                  <PermissionFolderSection 
                    title="Others" icon="📁" folders={filteredOthersFolders} assignedFolderIds={assignedIds} onToggleAll={handleCategoryFolderToggle} onToggleSingle={(fid, chk) => { toggleFolderAccess(fid, chk); }} 
                  />
                </>
              ) : (
                <div className="ds-text-empty-italic mt-8 p-4 border border-dashed rounded text-center">Select "View Infrastructure Items" to configure folders</div>
              )}

              {isSelected("network:infra:add") ? (
                <>
                  <h6 className="ds-text-heading-md mt-8">Add New Inventory Allowed Folders</h6>
                  <PermissionFolderSection 
                    themeClass="ds-folder-add-section"
                    title="Infrastructure" icon="🏢" folders={filteredInfrastructureFolders} assignedFolderIds={assignedAddIds} onToggleAll={handleAddCategoryFolderToggle} onToggleSingle={(fid, chk) => {
                      toggleFolderAddAccess(fid, chk);
                      if(chk) ["network:view", "network:infra:add"].forEach(p => { if (!selectedPermissions.includes(p)) togglePermission(p); });
                    }} 
                  />
                  <div className="my-4 border-t border-indigo-200 dark:border-indigo-800"></div>
                  <PermissionFolderSection 
                    themeClass="ds-folder-add-section"
                    title="Customers" icon="👥" folders={filteredCustomerFolders} assignedFolderIds={assignedAddIds} onToggleAll={handleAddCategoryFolderToggle} onToggleSingle={(fid, chk) => { toggleFolderAddAccess(fid, chk); }} 
                  />
                  <div className="my-4 border-t border-indigo-200 dark:border-indigo-800"></div>
                  <PermissionFolderSection 
                    themeClass="ds-folder-add-section"
                    title="Others" icon="📁" folders={filteredOthersFolders} assignedFolderIds={assignedAddIds} onToggleAll={handleAddCategoryFolderToggle} onToggleSingle={(fid, chk) => { toggleFolderAddAccess(fid, chk); }} 
                  />
                </>
              ) : (
                <div className="ds-text-empty-italic mt-8 p-4 border border-dashed rounded text-center">Select "Add New Inventory" to configure write-allowed folders</div>
              )}
            </div>
          </div>
        );

      case "dashboard":
        return <div className="ds-space-y-4">{renderItem("dashboard:view", "View Dashboard", "Grants access to main dashboard.")}</div>;

      case "users":
        return (
          <div className="ds-space-y-4">
            {renderItem("users:view", "View Users", "Allows viewing user directory.")}
            {isSelected("users:view") && (
              <div className="pg-item-row indent">
                {renderItem("users:create", "Create Users", "")}
                {renderItem("users:edit", "Edit Users", "")}
                {renderItem("users:delete", "Delete Users", "")}
                <div className="my-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <h6 className="ds-text-heading-sm mb-2">Advanced Actions</h6>
                  {renderItem("users:manage_permissions", "Manage Permissions", "")}
                  {renderItem("users:reset_password", "Reset Password", "")}
                  {renderItem("users:manage_security", "Manage Security", "")}
                  {renderItem("users:import", "Import Users", "")}
                  {renderItem("users:export", "Export Users", "")}
                </div>
              </div>
            )}
          </div>
        );

      case "admin":
        return (
          <div className="ds-space-y-4">
            {renderItem("admin:view", "View Admin Tab", "Grants access to the administrative configuration portal.")}
            {isSelected("admin:view") && (
              <div className="ds-grid-2col-gap3 indent ds-sub-items-red mt-4">
                {renderItem("admin:audit_logs", "Audit Logs", "Allows viewing system-wide activity logs.")}
                {isSelected("admin:audit_logs") && (
                  <div className="indent ds-space-y-4 w-full" style={{ gridColumn: 'span 2' }}>
                    {renderItem("admin:audit_logs:export", "Export CSV", "", true)}
                    {renderItem("admin:audit_logs:clear", "Clear All Logs", "", true)}
                  </div>
                )}
                {renderItem("admin:region_request", "Region Request", "Allows processing territory reassignment requests.")}
                {renderItem("admin:bulk_assignment", "Bulk Assignment", "Permits applying policy overrides to batches.")}
                {renderItem("admin:temp_access", "Temporary Access", "Permits generating time-limited access tokens.")}
                {renderItem("admin:export_reports", "Export Reports", "Allows generating unified compliance reports.")}
                {renderItem("admin:password_reset", "Global Password Reset", "Force platform-wide password reset.")}
                {renderItem("admin:role_builder", "Role Builder", "Critical: Define new security roles.")}
                {renderItem("admin:region_boundaries", "Region Boundaries", "Permits editing core boundary logic.")}
                {renderItem("admin:system_updates", "System Updates", "Manage and deploy system updates.")}
                {renderItem("admin:database", "Database Backup", "Triggers PostgreSQL snapshots.")}
                {isSelected("admin:database") && (
                  <div className="indent" style={{ gridColumn: 'span 2' }}>
                    {renderItem("admin:database:export", "Targeted Export", "", true)}
                  </div>
                )}
                {renderItem("data:export", "Data Export", "Grants high-level export ability.", false)}
              </div>
            )}
          </div>
        );

      case "analytics":
        return <div className="ds-space-y-4">{renderItem("analytics:view", "View Analytics", "Grants access to telemetry.")}</div>;

      case "converters":
        return (
          <div className="ds-space-y-4">
            {renderItem("converter:view", "View Converters Tab", "Unlocks data translation interface.")}
            {isSelected("converter:view") && (
              <div className="indent mt-2">
                {renderItem("converter:excel_to_kml", "Excel to KML Tool", "")}
              </div>
            )}
          </div>
        );

      case "help":
        return (
          <div className="ds-space-y-4">
            <h6 className="ds-text-heading-md">Schema & API Documentation</h6>
            {renderItem("system:schema:view", "View Database Schema", "Read-only access to schema visualizer.")}
            {isSelected("system:schema:view") && (
              <div className="indent ds-sub-items-blue">
                {renderItem("system:schema:export:pdf", "Export Schema PDF", "")}
                {renderItem("system:schema:export:image", "Export Schema Image", "")}
                {renderItem("system:schema:annotate", "Annotate Schema", "")}
                {renderItem("system:schema:query", "Run SQL Queries", "")}
                {renderItem("system:schema:erd", "Global ER Diagram", "")}
              </div>
            )}
            <div className="my-4 border-t border-gray-100 dark:border-gray-700"></div>
            {renderItem("system:api:view", "View API Documentation", "Access embedded Swagger/OpenAPI.")}
            {isSelected("system:api:view") && (
              <div className="indent ds-sub-items-blue">
                {renderItem("system:api:export", "Export API PDF", "")}
                {renderItem("system:api:edit", "Edit API Docs", "")}
              </div>
            )}
            <div className="my-4 border-t border-gray-100 dark:border-gray-700"></div>
            {renderItem("system:architecture:view", "View Server Architecture", "")}
          </div>
        );

      case "regions":
        return <RegionSelector selectedRegions={assignedRegions} onChange={setAssignedRegions} />;

      case "darkfiber":
        return (
          <div className="ds-space-y-4">
            <h6 className="ds-text-heading-md">Module Redesign Access</h6>
            {renderItem("darkfiber:view", "View Dark Fiber Tab", "Allows access to dark fiber during redesign.")}
          </div>
        );

      default:
        return <div>Select a category</div>;
    }
  };

  const isAllGloballySelected = Object.values(VISIBLE_PERMISSIONS).flat().every((p) => selectedPermissions.includes(p) || groupPermissions.includes(p));

  const handleCategorySelectAll = () => {
    const catPerms = VISIBLE_PERMISSIONS[activeCategory as keyof typeof VISIBLE_PERMISSIONS] || [];
    const isAllSelected = catPerms.every((p) => selectedPermissions.includes(p) || groupPermissions.includes(p));

    if (isAllSelected) {
      catPerms.forEach((p) => { if (selectedPermissions.includes(p)) togglePermission(p); });
    } else {
      catPerms.forEach((p) => { if (!selectedPermissions.includes(p) && !groupPermissions.includes(p)) togglePermission(p); });
    }
  };

  return (
    <div className="pg-modal-container">
      <div className="pg-layout-split">
        <PermissionCategoryNav
          categories={CATEGORIES}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onGlobalToggle={handleGlobalToggle}
          isAllGloballySelected={isAllGloballySelected}
        />
        <div className="pg-main-area">
          <div className="pg-main-header">
            <div className="pg-main-title-group">
              <span className="pg-main-title-icon">
                {CATEGORIES.find((c) => c.id === activeCategory)?.icon}
              </span>
              <h2 className="pg-main-title">
                {CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </h2>
            </div>
            <button type="button" onClick={handleCategorySelectAll} className="pg-cat-toggle-btn">
              {(VISIBLE_PERMISSIONS[activeCategory as keyof typeof VISIBLE_PERMISSIONS] || []).every((p) => selectedPermissions.includes(p) || groupPermissions.includes(p)) ? "Deselect All in " : "Select All in "}
              {CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </button>
          </div>
          <div className="pg-main-content custom-scrollbar">
            {renderCategoryContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionsDialogContent;
