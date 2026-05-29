import { useState, useEffect } from "react";
import { User } from "../../../../types/auth/index";
import {
  getUserPermissionsAPI,
  updateUserPermissionsAPI,
  getPermissionCatalogAPI,
  getUserFolderAccessAPI,
  bulkAssignUserFolderAccessAPI,
  getUserFolderAddAccessAPI,
  bulkAssignUserFolderAddAccessAPI,
  PermissionCatalog,
  FolderAccessAssignment,
} from "../../../../services/userPermissionApiService";
import { networkPlanningService } from "../../../network-planning/services/api"; // Correct path based on previous check
import { apiService } from "../../../../services/api";
import { showToast } from "../../../../utils/toastUtils";

export const useUserPermissionsDialog = (
  user: User,
  onSave?: () => void,
  onClose?: () => void,
) => {
  const BLACKLIST = ["gis.infrastructure.use", "gis.infrastructure.loader"];
  // Permissions State
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [groupPermissions, setGroupPermissions] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalog>({});

  // Region Access State
  const [assignedRegions, setAssignedRegions] = useState<string[]>([]);

  // Folder Access State
  const [folderAssignments, setFolderAssignments] = useState<
    FolderAccessAssignment[]
  >([]);
  const [originalFolderAssignments, setOriginalFolderAssignments] = useState<
    FolderAccessAssignment[]
  >([]);

  // Folder Add Access State
  const [folderAddAssignments, setFolderAddAssignments] = useState<
    FolderAccessAssignment[]
  >([]);
  const [originalFolderAddAssignments, setOriginalFolderAddAssignments] = useState<
    FolderAccessAssignment[]
  >([]);

  // Split catalog into categories
  const [infrastructureFolders, setInfrastructureFolders] = useState<any[]>([]);
  const [customerFolders, setCustomerFolders] = useState<any[]>([]);
  const [othersFolders, setOthersFolders] = useState<any[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleDetached, setRoleDetached] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "permissions" | "folders"
  >("permissions");

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Sanitize ID: Remove non-numeric characters (OCGID006 -> 6)
      const numericId = user.id.toString().replace(/\D/g, "");

      // Parallel Fetch
      const [perms, cat, folders, addFolders, treeData, regionRes] = await Promise.all([
        getUserPermissionsAPI(numericId),
        getPermissionCatalogAPI(),
        getUserFolderAccessAPI(numericId),
        getUserFolderAddAccessAPI(numericId),
        networkPlanningService.getUnifiedCatalog(Number(numericId)),
        apiService
          .get(`/users/${numericId}/regions`)
          .catch(() => ({ data: { regions: [] } })),
      ]);

      // Filter out blacklisted permissions from user's current direct permissions
      const cleanDirect = perms.direct.filter(
        (p: string) => !BLACKLIST.includes(p),
      );
      setSelectedPermissions(cleanDirect);
      setGroupPermissions(perms.fromGroups);

      setCatalog(cat);
      setFolderAssignments(folders);
      setOriginalFolderAssignments(folders);
      setFolderAddAssignments(addFolders);
      setOriginalFolderAddAssignments(addFolders);

      // Handle Regions
      const regionNames =
        regionRes.data?.regions?.map((r: any) => r.name) || [];
      setAssignedRegions(regionNames);

      // Handle Unified Catalog response { infrastructure: [], customers: [], others: [] }
      if (
        treeData &&
        typeof treeData === "object" &&
        !Array.isArray(treeData)
      ) {
        setInfrastructureFolders(
          Array.isArray(treeData.infrastructure) ? treeData.infrastructure : [],
        );
        setCustomerFolders(
          Array.isArray(treeData.customers) ? treeData.customers : [],
        );
        setOthersFolders(
          Array.isArray(treeData.others) ? treeData.others : [],
        );
      } else {
        // Fallback or legacy array response
        setInfrastructureFolders(Array.isArray(treeData) ? treeData : []);
        setCustomerFolders([]);
        setOthersFolders([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-selection of region folders removed. Dynamic backend filtering handles this.

  const handleSave = async (shouldActivate = false) => {
    setIsSaving(true);
    setError(null);

    try {
      // Sanitize ID
      const numericId = user.id.toString().replace(/\D/g, "");

      // 0. Detach Role if requested (Set to 'custom')
      if (roleDetached) {
          await apiService.put(`/users/${numericId}`, { role: 'custom' });
      }

      // 1. Save Permissions + Regions
      await apiService.put(`/users/${numericId}/permissions`, {
        permissions: selectedPermissions,
        assignedRegions: assignedRegions,
        // map_preferences: user.map_preferences, // Optional: if we want to save them here too. But maybe not needed if it's separate?
        // Actually, the user asked to FIX map preferences disappearing.
        // If the permissions dialog overwrites the user record, we must ensure we don't LOSE map_preferences.
        // But the PUT /permissions endpoint usually just updates permissions.
        // Let's check the backend controller again.
      });

      // 2. Save Folder Access (Diff Logic)
      const changes: {
        folderId: number;
        access: Partial<FolderAccessAssignment> | null;
      }[] = [];

      const currentIds = new Set(folderAssignments.map((f) => f.folder_id));
      const originalIds = new Set(
        originalFolderAssignments.map((f) => f.folder_id),
      );

      // Added Assignments
      folderAssignments.forEach((f) => {
        if (!originalIds.has(f.folder_id)) {
          // Default to Read Access when adding via checkbox
          changes.push({
            folderId: f.folder_id,
            access: {
              can_read: true,
              can_write: false,
              can_edit: false,
              can_delete: false,
            },
          });
        }
      });

      // Removed Assignments
      originalFolderAssignments.forEach((f) => {
        if (!currentIds.has(f.folder_id)) {
          changes.push({ folderId: f.folder_id, access: null }); // Revoke
        }
      });

      if (changes.length > 0) {
        await bulkAssignUserFolderAccessAPI(numericId, changes);
      }

      // 2.5 Save Folder Add Access (Diff Logic)
      const addChanges: {
        folderId: number;
        access: Partial<FolderAccessAssignment> | null;
      }[] = [];

      const currentAddIds = new Set(folderAddAssignments.map((f) => f.folder_id));
      const originalAddIds = new Set(
        originalFolderAddAssignments.map((f) => f.folder_id),
      );

      folderAddAssignments.forEach((f) => {
        if (!originalAddIds.has(f.folder_id)) {
          addChanges.push({
            folderId: f.folder_id,
            access: { can_read: true, can_write: true, can_edit: false, can_delete: false },
          });
        }
      });

      originalFolderAddAssignments.forEach((f) => {
        if (!currentAddIds.has(f.folder_id)) {
          addChanges.push({ folderId: f.folder_id, access: null });
        }
      });

      if (addChanges.length > 0) {
        await bulkAssignUserFolderAddAccessAPI(numericId, addChanges);
      }

      // 3. Activate User (Safe Onboarding)
      if (shouldActivate && !user.is_active) {
        // Correct endpoint: PATCH /api/users/:id/activate
        await apiService.patch(`/users/${numericId}/activate`, {
          is_active: true,
        });
      }

      showToast.success("Permissions updated successfully");

      if (onSave) onSave();
      if (onClose) onClose();
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save changes");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Blocking Warning State (No Detachment)
  const [permissionWarning, setPermissionWarning] = useState<{
    isOpen: boolean;
    permissionId: string | null;
  }>({
    isOpen: false,
    permissionId: null,
  });

  const closeWarning = () => {
    setPermissionWarning({ isOpen: false, permissionId: null });
  };

  const togglePermission = (permissionId: string) => {
    // Check if modifying an inherited (Group) permission
    if (groupPermissions.includes(permissionId)) {
      setPermissionWarning({
        isOpen: true,
        permissionId,
      });
      return;
    }

    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId],
    );
  };

  const togglePermissionGroup = (permissionIds: string[], checked: boolean) => {
    // Filter out inherited permissions that cannot be toggled directly
    const toggleableIds = permissionIds.filter(id => !groupPermissions.includes(id));
    
    if (checked) {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...toggleableIds])));
    } else {
      setSelectedPermissions(prev => prev.filter(id => !toggleableIds.includes(id)));
    }
  };

  // Manual permissions not always in catalog
  const EXTRA_PERMISSIONS: Record<string, string[]> = {
    map: [
      "map:tools:distance",
      "map:tools:polygon",
      "map:tools:circle",
      "map:tools:elevation",
      "map:tools:sector_rf",
    ], // Added manual permissions for Map Tools
    network: [
      // Sub-permissions not in catalog
      "network:infra:delete",
      "network:infra:delete_submission_history",
      "network:infra:delete_approval_history",
      "network:recycle:restore",
      "network:recycle:delete",
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
      "network:manage_features",
      "network:tools:export",
    ],
    datahub: [
      // Check if these are in catalog. If yes, remove.
      // SQL has: feature:delete, delete_all, filter. So effectively empty if catalog is loaded.
      // Leaving empty to rely on catalog.
    ],
    admin: [
      // Only keep sub-permissions NOT in SQL catalog
      "admin:audit_logs:export",
      "admin:audit_logs:clear",
      "admin:permissions:manage",
      "admin:temp_access:grant",
      "admin:temp_access:revoke",
    ],
    users: ["users:edit:any", "users:import", "users:export"],
    help: [
      "system:schema:view",
      "system:schema:query", 
      "system:schema:export",
      "system:schema:annotate",
      "system:api:view", 
      "system:api:edit"
    ],
  };

  const selectAllPermissionsInCategory = (category: string) => {
    const catalogPermissions =
      catalog[category]
        ?.map((p) => p.code)
        .filter((c) => !BLACKLIST.includes(c)) || [];
    const extraPermissions = EXTRA_PERMISSIONS[category] || [];

    // Union of both lists
    const categoryPermissions = Array.from(
      new Set([...catalogPermissions, ...extraPermissions]),
    );

    const allSelected =
      categoryPermissions.length > 0 &&
      categoryPermissions.every((p) => selectedPermissions.includes(p));

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !categoryPermissions.includes(p)),
      );
    } else {
      setSelectedPermissions((prev) =>
        Array.from(new Set([...prev, ...categoryPermissions])),
      );
    }
  };

  const selectAllPermissions = () => {
    // 1. Collect all Catalog Permissions
    let allPermissions = Object.values(catalog)
      .flat()
      .map((p) => p.code)
      .filter((c) => !BLACKLIST.includes(c));

    // 2. Add Hardcoded/Manual Permissions
    const manualPermissions = Object.values(EXTRA_PERMISSIONS).flat();

    allPermissions = Array.from(
      new Set([...allPermissions, ...manualPermissions]),
    );

    // 3. Check selection status
    const allPermsSelected =
      allPermissions.length > 0 &&
      allPermissions.every((p) => selectedPermissions.includes(p));

    // 4. Handle Permissions Toggle
    if (allPermsSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allPermissions);
    }

    // 5. Handle Folders Toggle
    // If we are selecting all permissions, we should also select all folders.
    // If deselecting, we deselect folders.
    // Using simple logic: If allPermsSelected (Deselect Mode) -> Remove Folders. Else -> Add Folders.

    if (allPermsSelected) {
      setFolderAssignments([]);
    } else {
      // Collect ALL folder IDs
      const allFolderIds: number[] = [];
      const collectIds = (folders: any[]) => {
        folders.forEach((f) => {
          allFolderIds.push(f.id);
          if (f.children) collectIds(f.children);
        });
      };
      collectIds(infrastructureFolders);
      collectIds(customerFolders);
      collectIds(othersFolders);

      const numericId = Number(user.id.toString().replace(/\D/g, ""));

      // Map to assignments
      const newAssignments = allFolderIds.map((id) => ({
        id: 0,
        user_id: numericId,
        folder_id: id,
        folder_name: "",
        can_read: true,
        can_write: false,
        can_edit: false,
        can_delete: false,
        granted_at: new Date().toISOString(),
      }));

      setFolderAssignments(newAssignments);
    }
  };

  const toggleFolderAccess = (folderId: number, checked: boolean) => {
    if (checked) {
      const numericId = Number(user.id.toString().replace(/\D/g, ""));
      // Add (optimistic)
      const newAssignment: FolderAccessAssignment = {
        id: 0,
        user_id: numericId,
        folder_id: folderId,
        folder_name: "", // UI doesn't need this immediately if tree has it
        can_read: true,
        can_write: false,
        can_edit: false,
        can_delete: false,
        granted_at: new Date().toISOString(),
      };
      setFolderAssignments((prev) => [...prev, newAssignment]);
    } else {
      // Remove
      setFolderAssignments((prev) =>
        prev.filter((f) => f.folder_id !== folderId),
      );
    }
  };

  const toggleCategoryFolderAccess = (
    categoryFolders: any[],
    checked: boolean,
  ) => {
    const numericId = Number(user.id.toString().replace(/\D/g, ""));
    const allFolderIds: number[] = [];

    // Helper to collect all folder IDs recursively
    const collectIds = (folders: any[]) => {
      folders.forEach((f) => {
        allFolderIds.push(f.id);
        if (f.children && f.children.length > 0) {
          collectIds(f.children);
        }
      });
    };
    collectIds(categoryFolders);

    if (checked) {
      // Add all missing assignments
      const newAssignments = allFolderIds
        .filter((id) => !folderAssignments.some((fa) => fa.folder_id === id))
        .map((id) => ({
          id: 0,
          user_id: numericId,
          folder_id: id,
          folder_name: "",
          can_read: true,
          can_write: false,
          can_edit: false,
          can_delete: false,
          granted_at: new Date().toISOString(),
        }));

      setFolderAssignments((prev) => [...prev, ...newAssignments]);
    } else {
      // Remove all assignments for these folders
      setFolderAssignments((prev) =>
        prev.filter((fa) => !allFolderIds.includes(fa.folder_id)),
      );
    }
  };

  const toggleFolderAddAccess = (folderId: number, checked: boolean) => {
    if (checked) {
      const numericId = Number(user.id.toString().replace(/\D/g, ""));
      const newAssignment: FolderAccessAssignment = {
        id: 0,
        user_id: numericId,
        folder_id: folderId,
        folder_name: "",
        can_read: true,
        can_write: true,
        can_edit: false,
        can_delete: false,
        granted_at: new Date().toISOString(),
      };
      setFolderAddAssignments((prev) => [...prev, newAssignment]);
    } else {
      setFolderAddAssignments((prev) =>
        prev.filter((f) => f.folder_id !== folderId),
      );
    }
  };

  const toggleCategoryFolderAddAccess = (
    categoryFolders: any[],
    checked: boolean,
  ) => {
    const numericId = Number(user.id.toString().replace(/\D/g, ""));
    const allFolderIds: number[] = [];
    const collectIds = (folders: any[]) => {
      folders.forEach((f) => {
        allFolderIds.push(f.id);
        if (f.children && f.children.length > 0) collectIds(f.children);
      });
    };
    collectIds(categoryFolders);

    if (checked) {
      const newAssignments = allFolderIds
        .filter((id) => !folderAddAssignments.some((fa) => fa.folder_id === id))
        .map((id) => ({
          id: 0,
          user_id: numericId,
          folder_id: id,
          folder_name: "",
          can_read: true,
          can_write: true,
          can_edit: false,
          can_delete: false,
          granted_at: new Date().toISOString(),
        }));
      setFolderAddAssignments((prev) => [...prev, ...newAssignments]);
    } else {
      setFolderAddAssignments((prev) =>
        prev.filter((fa) => !allFolderIds.includes(fa.folder_id)),
      );
    }
  };

  // Calculate Total Permissions for Display
  const allKnownPermissions = new Set([
    ...Object.values(catalog)
      .flat()
      .map((p) => p.code)
      .filter((c) => !BLACKLIST.includes(c)),
    ...Object.values(EXTRA_PERMISSIONS).flat(),
  ]);
  const totalPermissionsCount = allKnownPermissions.size || 50;

  return {
    selectedPermissions,
    groupPermissions,
    catalog,
    folderAssignments,
    folderAddAssignments,
    infrastructureFolders,
    customerFolders,
    othersFolders,
    assignedRegions,
    setAssignedRegions,
    isLoading,
    isSaving,
    error,
    activeTab,
    setActiveTab,
    togglePermission,
    togglePermissionGroup,
    selectAllPermissionsInCategory,
    selectAllPermissions,
    toggleFolderAccess,
    toggleCategoryFolderAccess,
    toggleFolderAddAccess,
    toggleCategoryFolderAddAccess,
    handleSave,
    totalPermissionsCount,
    permissionWarning,
    closeWarning,
  };
};

