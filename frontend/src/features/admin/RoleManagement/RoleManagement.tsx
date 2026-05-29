import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { VISIBLE_PERMISSIONS } from "../../users/components/UserPermissionsDialog/permissionConfig";
import UserPermissionsDialogContent from "../../users/components/UserPermissionsDialog/UserPermissionsDialogContent";
import { rolesMatch } from "../../../utils/rbac/helpers";

// ─── Imports ───────────────────────────────────────────────────────
import { networkPlanningService } from "../../network-planning/services/api";
// import { FolderAccessTree } from "../../users/components/UserPermissionsDialog/FolderAccessTree"; // Not needed if using Content

// ─── Types ───────────────────────────────────────────────────────
interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  color: string;
  icon: string;
  is_system: boolean;
  is_active: boolean;
  userCount: number;
  permissionCount: number | string;
  default_folder_ids?: number[]; // Added for default folder access
  folderCount?: number;
}

// ─── Permission Category Metadata (matches Permission Dialog) ────
const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  map: { label: "Map", icon: "🗺️", color: "blue" },
  datahub: { label: "GIS Data Hub", icon: "📁", color: "purple" },
  network: { label: "Network Planning", icon: "🌐", color: "indigo" },
  dashboard: { label: "Dashboard", icon: "📊", color: "green" },
  users: { label: "Users", icon: "👤", color: "orange" },
  groups: { label: "Groups", icon: "👥", color: "teal" },
  admin: { label: "Admin", icon: "🛡️", color: "red" },
  analytics: { label: "Analytics", icon: "📈", color: "pink" },
  regions: { label: "Regions", icon: "🗺️", color: "amber" },

  converters: { label: "Converters", icon: "🔄", color: "cyan" },
  help: { label: "Help Menu", icon: "❓", color: "cyan" },
};

// ─── Exact Permission Labels (matches Permission Dialog) ─────────
const PERMISSION_LABELS: Record<string, { name: string; description?: string }> = {
  // Map
  "map:view": { name: "View Map Tab", description: "Access the main map interface" },
  "map:tools:distance": { name: "Distance Measurement" },
  "map:tools:polygon": { name: "Polygon Tool" },
  "map:tools:circle": { name: "Circle Tool" },
  "map:tools:elevation": { name: "Elevation Profile" },
  "map:tools:sector_rf": { name: "Sector RF Coverage" },
  // Data Hub
  "datahub:view": { name: "View Data Hub" },
  "datahub:feature:filter": { name: "Filter Features" },
  "datahub:feature:delete": { name: "Delete Feature" },
  "datahub:feature:delete_all": { name: "Delete All Features" },
  // Network Planning
  "network:infra:items": { name: "View Infrastructure Items", description: "Enable access to Network Folders" },

  "network:infra:add": { name: "Add New Inventory" },
  "network:recycle_bin": { name: "View Recycle Bin" },
  "network:recycle:restore": { name: "Restore Items", description: "Restore deleted infrastructure" },
  "network:recycle:delete": { name: "Permanently Delete", description: "Irreversible action" },
  "network:folder:create": { name: "Create New Folders" },
  "network:file:import": { name: "Import Files" },
  "network:manage_features": { name: "Manage Features", description: "Enable Edit/Delete buttons" },
  "network:file:edit_planned": { name: "Edit Planned Data (Form)", description: "Modify planned submissions" },
  "network:file:live_edit_planned": { name: "Live Edit Planned Data (In-line)" },
  "network:file:delete_file_planned": { name: "Delete Planned File (Modal)" },
  "network:file:delete_feature_planned": { name: "Delete Planned Feature (Grid)" },

  "network:file:edit_live": { name: "Edit Live Data (Form)", description: "Modify active infrastructure" },
  "network:file:live_edit_live": { name: "Live Edit Live Data (In-line)" },
  "network:file:delete_file_live": { name: "Delete Live File (Modal)" },
  "network:file:delete_feature_live": { name: "Delete Live Feature (Grid)" },

  "network:file:edit_imported": { name: "Edit Imported Data (Form)", description: "Modify user-uploaded data" },
  "network:file:live_edit_imported": { name: "Live Edit Imported Data (In-line)" },
  "network:file:delete_file_imported": { name: "Delete Imported File (Modal)" },
  "network:file:delete_feature_imported": { name: "Delete Imported Feature (Grid)" },

  "network:tools:export": { name: "Export Data Tool", description: "Allow exporting Network Data, Live Inventory, and Files" },
  "network:view": { name: "View Network Page" },
  "network:map:view": { name: "View Network Map" },
  // Dashboard
  "dashboard:view": { name: "View Dashboard" },
  // Users
  "users:view": { name: "View Users" },
  "users:create": { name: "Create Users" },
  "users:edit": { name: "Edit Users", description: "Edit user details" },
  "users:delete": { name: "Delete Users", description: "Remove user accounts" },
  "users:manage_permissions": { name: "Manage Permissions", description: "Assign roles/permissions" },
  "users:reset_password": { name: "Reset Password", description: "Change user passwords" },
  "users:manage_security": { name: "Manage Security", description: "Verify email, Manage 2FA" },
  "users:import": { name: "Import Users", description: "Allow bulk user import (Excel)" },
  "users:export": { name: "Export Users", description: "Allow exporting user list" },
  // Groups
  "groups:view": { name: "View Groups" },
  "groups:create": { name: "Create Groups" },
  "groups:edit": { name: "Edit Groups" },
  "groups:delete": { name: "Delete Groups" },
  // Admin
  "admin:view": { name: "View Admin Tab", description: "Access the Admin interface" },
  "admin:audit_logs": { name: "Audit Logs", description: "View system audit logs" },
  "admin:audit_logs:export": { name: "Export CSV", description: "Export logs to CSV file" },
  "admin:audit_logs:clear": { name: "Clear All Logs", description: "Delete all audit logs" },
  "admin:region_request": { name: "Region Request", description: "Manage region access requests" },
  "admin:bulk_assignment": { name: "Bulk Assignment", description: "Bulk assign regions/roles" },
  "admin:temp_access": { name: "Temporary Access", description: "Manage temporary user access" },
  "admin:export_reports": { name: "Export Reports", description: "Export system reports" },
  "admin:password_reset": { name: "Password Reset", description: "Reset user passwords" },
  "admin:region_boundaries": { name: "Region Boundaries", description: "Manage map region limits" },
  "admin:database": { name: "Database", description: "Database management tools" },
  "admin:role_builder": { name: "Role Builder", description: "Create and manage custom roles with permissions" },
  "system:schema:view": { name: "Database Schema", description: "View database structure" },
  "system:schema:query": { name: "SQL Runner Access", description: "Run Read-Only SQL Queries" },
  "system:schema:export": { name: "Export Diagrams", description: "Save Schema as Image" },
  // Analytics
  "analytics:view": { name: "View Analytics" },
  // Dark Fiber

};

// ─── Color Options ───────────────────────────────────────────────
const COLOR_OPTIONS = [
  { value: "#7C3AED", label: "Purple" },
  { value: "#2563EB", label: "Blue" },
  { value: "#059669", label: "Green" },
  { value: "#D97706", label: "Amber" },
  { value: "#DC2626", label: "Red" },
  { value: "#6B7280", label: "Gray" },
  { value: "#EC4899", label: "Pink" },
  { value: "#0891B2", label: "Cyan" },
  { value: "#7C2D12", label: "Brown" },
  { value: "#4F46E5", label: "Indigo" },
];

// ─── Icon Options ────────────────────────────────────────────────
const ICON_OPTIONS = [
  { value: "shield", label: "Shield" },
  { value: "briefcase", label: "Briefcase" },
  { value: "cog", label: "Settings" },
  { value: "code", label: "Code" },
  { value: "user", label: "User" },
  { value: "eye", label: "Eye" },
  { value: "wrench", label: "Wrench" },
  { value: "chart", label: "Chart" },
  { value: "star", label: "Star" },
  { value: "key", label: "Key" },
];

const ICON_SVG: Record<string, React.ReactNode> = {
  shield: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  briefcase: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  cog: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  code: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  eye: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  wrench: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-2.5 2.5L14 10m-2-2l-3.5 3.5M3 21l3.5-3.5" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  star: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  key: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
};

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:82/api";

// ─── Main Component ──────────────────────────────────────────────
const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [formColor, setFormColor] = useState("#6B7280");
  const [formIcon, setFormIcon] = useState("user");
  const [formFolderIds, setFormFolderIds] = useState<number[]>([]);

  const [infrastructureFolders, setInfrastructureFolders] = useState<any[]>([]);
  const [customerFolders, setCustomerFolders] = useState<any[]>([]);
  const [othersFolders, setOthersFolders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"permissions" | "folders">("permissions");

  // Handlers for UserPermissionsDialogContent compatibility
  const handleTogglePermission = (id: string) => {
    setFormPermissions((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      return [...prev, id];
    });
  };

  const handleTogglePermissionGroup = (ids: string[], checked: boolean) => {
    setFormPermissions((prev) => {
        if (checked) {
            return Array.from(new Set([...prev, ...ids]));
        } else {
            return prev.filter(id => !ids.includes(id));
        }
    });
  };

  const handleToggleFolderAccess = (folderId: number, checked: boolean) => {
    setFormFolderIds((prev) => {
        if (checked) return [...prev, folderId];
        return prev.filter(id => id !== folderId);
    });
  };

  const handleToggleCategoryFolderAccess = (folders: any[], checked: boolean) => {
        const allIds: number[] = [];
        const collectIds = (nodes: any[]) => {
            nodes.forEach((n) => {
                allIds.push(n.id);
                if (n.children) collectIds(n.children);
            });
        };
        collectIds(folders);
        
        setFormFolderIds(prev => {
            const current = new Set(prev);
            if (checked) {
                allIds.forEach(id => current.add(id));
            } else {
                allIds.forEach(id => current.delete(id));
            }
            return Array.from(current);
        });
  };

  const getAuthHeaders = () => {
    const token =
      sessionStorage.getItem("opti_connect_token") ||
      localStorage.getItem("opti_connect_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // ─── Fetch Roles ─────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/roles`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setRoles(data.roles);
      } else {
        setError(data.error || "Failed to fetch roles");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchRoles();
  }, [fetchRoles]);

  const allPerms = Object.values(VISIBLE_PERMISSIONS).flat();
  const isEditorOpen = isCreating || editingRole !== null;

  // ─── Fetch Folders (Catalog) ─────────────────────────────────
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        // Fetch full catalog (using current user ID which is likely admin)
        // We really want the GLOBAL catalog structure here.
        const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
        // Sanitize ID: Remove non-numeric characters (OCGID006 -> 6)
        const numericId = Number(currentUser.id?.toString().replace(/\D/g, "") || 0);
        
        // Pass isAdmin = true to see all folders
        const catalog = await networkPlanningService.getUnifiedCatalog(numericId, null, false, true);
        
        if (catalog) {
           if (catalog.infrastructure) setInfrastructureFolders(catalog.infrastructure);
           if (catalog.customers) setCustomerFolders(catalog.customers);
           if (catalog.others) setOthersFolders(catalog.others);
        }
      } catch (err) {
        console.error("Failed to fetch folder catalog for Role Builder", err);
      }
    };
    
    if (isEditorOpen) {
      fetchCatalog();
    }
  }, [isEditorOpen]);

  // Auto-dismiss messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ─── Reset Form ──────────────────────────────────────────────
  const resetForm = () => {
    setFormName("");
    setFormDisplayName("");
    setFormDescription("");
    setFormPermissions([]);
    setFormFolderIds([]);
    setFormColor("#6B7280");
    setFormIcon("user");
    setEditingRole(null);
    setIsCreating(false);
  };

  // ─── Start Edit ──────────────────────────────────────────────
  const startEdit = (role: Role) => {
    setEditingRole(role);
    setIsCreating(false);
    setFormName(role.name);
    setFormDisplayName(role.display_name);
    setFormDescription(role.description);
    setFormPermissions([...role.permissions]);
    setFormFolderIds(role.default_folder_ids || []);
    setFormColor(role.color);
    setFormIcon(role.icon);
  };

  // ─── Start Create ────────────────────────────────────────────
  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  // ─── Toggle Permission ────────────────────────────────────────
  // ─── Toggle Permission ────────────────────────────────────────
  const togglePermission = (perm: string) => {
    setFormPermissions((prev) => {
      if (prev.includes(perm)) {
        // Unchecking
        return prev.filter((p) => p !== perm);
      } else {
        // Checking - Auto-select parent view permission
        const newPerms = [...prev, perm];
        
        // Auto-select corresponding view permission if a child is selected
        const parts = perm.split(':');
        if (parts.length > 1) {
            const category = parts[0];
            const viewPerm = `${category}:view`;
            // Avoid adding if it's the view perm itself or already exists
            if (perm !== viewPerm && !newPerms.includes(viewPerm)) {
                // Verify if such a view perm actually exists in our definitions
                const allPerms = Object.values(VISIBLE_PERMISSIONS).flat();
                if (allPerms.includes(viewPerm)) {
                    newPerms.push(viewPerm);
                }
            }
        }
        return newPerms;
      }
    });
  };

  // ─── Toggle All in Category ───────────────────────────────────
  const toggleCategory = (category: string) => {
    const perms: string[] = [...(VISIBLE_PERMISSIONS[category as keyof typeof VISIBLE_PERMISSIONS] || [])];
    const allSelected = perms.every((p) => formPermissions.includes(p));
    if (allSelected) {
      setFormPermissions((prev) => prev.filter((p) => !perms.includes(p)));
    } else {
      setFormPermissions((prev) => Array.from(new Set([...prev, ...perms])));
    }
  };

  // ─── Select All Permissions ────────────────────────────────────
  const selectAllPermissions = () => {
    const allPerms = Object.values(VISIBLE_PERMISSIONS).flat();
    const allSelected = allPerms.every((p) => formPermissions.includes(p));
    setFormPermissions(allSelected ? [] : [...allPerms]);
  };

  // ─── Clone Role ──────────────────────────────────────────────
  const cloneRole = (role: Role) => {
    setIsCreating(true);
    setEditingRole(null);
    setFormName("");
    setFormDisplayName(`${role.display_name} (Copy)`);
    setFormDescription(role.description);
    setFormPermissions([...role.permissions]);
    setFormFolderIds(role.default_folder_ids || []);
    setFormColor(role.color);
    setFormIcon(role.icon);
  };

  // ─── Save Role ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!formDisplayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    if (isCreating && !formName.trim()) {
      toast.error("Role name is required");
      return;
    }

    setIsSaving(true);
    // setError(null);
    try {
      const url = editingRole
        ? `${API_URL}/roles/${editingRole.id}`
        : `${API_URL}/roles`;

      const body: any = {
        display_name: formDisplayName.trim(),
        description: formDescription.trim(),
        permissions: formPermissions,
        default_folder_ids: formFolderIds,
        color: formColor,
        icon: formIcon,
      };

      if (isCreating) {
        body.name = formName.trim().toLowerCase();
      }

      const response = await fetch(url, {
        method: editingRole ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || `Role ${editingRole ? "updated" : "created"} successfully`);
        resetForm();
        fetchRoles();
      } else {
        toast.error(data.error || "Failed to save role");
      }
    } catch (err) {
      toast.error("Failed to save role");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete Role ─────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Role deleted successfully");
        setDeleteConfirm(null);
        fetchRoles();
      } else {
        toast.error(data.error || "Failed to delete role");
      }
    } catch (err) {
      toast.error("Failed to delete role");
    }
  };

  const handleFolderToggle = (folderId: number, checked: boolean) => {
    setFormFolderIds(prev => 
      checked 
        ? [...prev, folderId]
        : prev.filter(id => id !== folderId)
    );
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Messages */}
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent mb-1">Role Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Create and manage roles with custom permissions. {roles.length} role{roles.length !== 1 ? 's' : ''} configured.
          </p>
        </div>
        {!isEditorOpen && (
          <button
            onClick={startCreate}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Role
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading roles...</span>
        </div>
      ) : (
        <>
          {/* Roles Grid */}
          {!isEditorOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="p-5">
                    {/* Role Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center text-white shadow-md"
                          style={{ backgroundColor: role.color }}
                        >
                          {ICON_SVG[role.icon] || ICON_SVG.user}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {role.display_name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {role.name}
                          </p>
                        </div>
                      </div>
                      {role.is_system && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          System
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {role.description || "No description"}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-medium">{role.permissionCount}</span> permissions
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium">{role.userCount}</span> users
                      </div>
                      {role.folderCount !== undefined && role.folderCount > 0 && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span className="font-medium">{role.folderCount}</span> folders
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => startEdit(role)}
                        disabled={role.name === "admin"}
                        className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => cloneRole(role)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Clone
                      </button>
                      {!role.is_system && (
                        <button
                          onClick={() => setDeleteConfirm(role.id)}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {deleteConfirm === role.id && (
                    <div className="px-5 pb-4 pt-2 bg-red-50 dark:bg-red-900/10 border-t border-red-200 dark:border-red-800 rounded-b-xl">
                      <p className="text-xs text-red-700 dark:text-red-300 mb-2">
                        Are you sure you want to delete <strong>{role.display_name}</strong>?
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Role Editor Panel */}
          {isEditorOpen && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg flex flex-col h-[750px]">
              {/* Editor Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white shadow-md relative group"
                    style={{ backgroundColor: formColor }}
                  >
                      {/* Icon Selector Trigger could go here, for now basic display */}
                    {ICON_SVG[formIcon] || ICON_SVG.user}
                    
                    {/* Quick Color/Icon Pickers could be added here or kept as before */}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                         <input
                           type="text"
                           value={formDisplayName}
                           onChange={(e) => {
                             const val = e.target.value;
                             setFormDisplayName(val);
                             if (isCreating) {
                               // Auto-generate slug for ID
                               setFormName(val.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
                             }
                           }}
                           className="font-bold text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                           placeholder="Role Name"
                         />
                         {isCreating && (
                             <input 
                               type="text"
                               value={formName}
                               onChange={(e) => setFormName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                               className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded border-none focus:ring-0 w-32"
                               placeholder="role_id"
                             />
                         )}
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {formPermissions.length} / {allPerms.length} permissions • {formFolderIds.length} folders
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                     {/* Color Picker / Icon Picker Tiny UI */}
                     <div className="flex gap-1">
                        {COLOR_OPTIONS.slice(0, 5).map(c => (
                            <button key={c.value} onClick={() => setFormColor(c.value)} className={`w-4 h-4 rounded-full ${formColor === c.value ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`} style={{backgroundColor: c.value}} />
                        ))}
                     </div>
                     <div className="h-4 w-px bg-gray-300 mx-2"></div>
                     <button
                          onClick={resetForm}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                     </button>
                </div>
              </div>

               {/* Content - UserPermissionDialogContent */}
               <div className="flex-1 overflow-hidden relative">
                  <UserPermissionsDialogContent
                    isLoading={false}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    catalog={{}} 
                    selectedPermissions={formPermissions}
                    groupPermissions={[]} // Roles don't inherit
                    infrastructureFolders={infrastructureFolders}
                    customerFolders={customerFolders}
                    othersFolders={othersFolders}
                    folderAssignments={formFolderIds.map(fid => ({
                        id: 0,
                        user_id: 0,
                        folder_id: fid,
                        folder_name: "",
                        can_read: true,
                        can_write: false,
                        can_edit: false,
                        can_delete: false,
                        granted_at: new Date().toISOString()
                    }))}
                    assignedRegions={[]}
                    setAssignedRegions={() => {}}
                    togglePermission={handleTogglePermission}
                    togglePermissionGroup={handleTogglePermissionGroup}
                    selectAllPermissionsInCategory={() => {}} // Handled by component sidebar
                    selectAllPermissions={() => {
                        const allPerms = Object.values(VISIBLE_PERMISSIONS).flat();
                        const allSelected = allPerms.every(p => formPermissions.includes(p));
                        setFormPermissions(allSelected ? [] : allPerms);
                    }}
                    toggleFolderAccess={handleToggleFolderAccess}
                    toggleCategoryFolderAccess={handleToggleCategoryFolderAccess}
                    folderAddAssignments={[]}
                    toggleFolderAddAccess={() => {}}
                    toggleCategoryFolderAddAccess={() => {}}
                    user={{ role: isCreating ? "New Role" : editingRole?.name, status: "Active", email: "Role Definition" }}
                   />
               </div>
               
               {/* Footer */}
               <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/30 rounded-b-xl flex-shrink-0">
                  <div className="text-xs text-gray-500">
                      {/* Description Input */}
                      <input 
                         type="text" 
                         value={formDescription} 
                         onChange={e => setFormDescription(e.target.value)}
                         placeholder="Description..."
                         className="w-64 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                  </div>
                 <div className="flex items-center space-x-2">
                   <button
                     onClick={resetForm}
                     disabled={isSaving}
                     className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={handleSave}
                     disabled={isSaving || (!formDisplayName.trim()) || (isCreating && !formName.trim())}
                     className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                   >
                     {isSaving && (
                       <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                     )}
                     {isCreating ? "Create Role" : "Update Role"}
                   </button>
                 </div>
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RoleManagement;
