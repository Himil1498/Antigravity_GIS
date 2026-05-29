import { useState, useEffect } from "react";
import type { User } from "../../../types/auth/index";
import type { ApiGroup } from '../../../services/group/index';
import {
  getGroupMembersAPI,
  getGroupPermissionsAPI,
  getGroupRegionsAPI,
} from '../../../services/group/index';
import {
  SYSTEM_PERMISSIONS,
  PermissionCategory,
} from "../../../types/permissions/index";
import { getAllUsers } from "../../../services/user/index";
import { GroupFormData, TabType } from '../types/form.types';
import { DEFAULT_FORM_DATA } from '../constants/groupConstants';

export const useGroupForm = (group: ApiGroup | null) => {
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [formData, setFormData] = useState<GroupFormData>({
    ...DEFAULT_FORM_DATA,
    name: group?.name || "",
    description: group?.description || "",
    isActive: group?.is_active !== undefined ? group.is_active : true,
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAllUsers();
        setAvailableUsers(users);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    loadUsers();
  }, []);

  // Load group data when editing
  useEffect(() => {
    const loadGroupData = async () => {
      if (!group?.id) return;
      try {
        const members = await getGroupMembersAPI(group.id);
        const memberIds = members.map((m: any) => m.user_id.toString());
        const { permissions } = await getGroupPermissionsAPI(group.id);
        const regions = await getGroupRegionsAPI(group.id);
        const regionNames = regions.map((r: any) => r.name || "").filter(Boolean);

        setFormData((prev) => ({
          ...prev,
          members: memberIds,
          permissions: permissions,
          assignedRegions: regionNames,
        }));
      } catch (error) {
        console.error("Error loading group data:", error);
      }
    };
    loadGroupData();
  }, [group]);

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const toggleMember = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((m) => m !== userId)
        : [...prev.members, userId],
    }));
  };

  const toggleRegion = (region: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedRegions: prev.assignedRegions.includes(region)
        ? prev.assignedRegions.filter((r) => r !== region)
        : [...prev.assignedRegions, region],
    }));
  };

  const selectAllPermissionsInCategory = (category: PermissionCategory) => {
    const categoryPermissions = SYSTEM_PERMISSIONS.filter(
      (p) => p.category === category
    ).map((p) => p.id);
    const allSelected = categoryPermissions.every((p) =>
      formData.permissions.includes(p)
    );

    if (allSelected) {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter(
          (p) => !categoryPermissions.includes(p)
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: Array.from(
          new Set([...prev.permissions, ...categoryPermissions])
        ),
      }));
    }
  };

  // Group permissions by category
  const permissionsByCategory = SYSTEM_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<PermissionCategory, typeof SYSTEM_PERMISSIONS>);

  return {
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    availableUsers,
    togglePermission,
    toggleMember,
    toggleRegion,
    selectAllPermissionsInCategory,
    permissionsByCategory,
  };
};



