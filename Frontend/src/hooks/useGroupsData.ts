// ============================================================================
// useGroupsData.ts - Custom hook for groups data management
// ============================================================================
import { useState, useEffect } from "react";
import {
  getAllGroupsAPI,
  createGroupAPI,
  updateGroupAPI,
  deleteGroupAPI,
  type ApiGroup,
} from "../services/group/groupApiService";
import type { UserGroup } from "../types/permissions/index";

interface NotificationState {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export const useGroupsData = () => {
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const fetchedGroups = await getAllGroupsAPI();
      setGroups(fetchedGroups);
    } catch (error: any) {
      console.error("Failed to load groups:", error);
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message:
          error.response?.data?.error || "Failed to load groups from server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (groupData: Partial<UserGroup>) => {
    setIsLoading(true);
    try {
      await createGroupAPI({
        name: groupData.name || "",
        description: groupData.description,
        is_active: groupData.isActive !== undefined ? groupData.isActive : true,
      });
      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "Group created successfully",
      });
      await loadGroups();
      return true;
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: error.response?.data?.error || "Failed to save group",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroup = async (
    groupId: number,
    groupData: Partial<UserGroup>
  ) => {
    setIsLoading(true);
    try {
      await updateGroupAPI(groupId, {
        name: groupData.name,
        description: groupData.description,
        is_active: groupData.isActive,
      });
      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "Group updated successfully",
      });
      await loadGroups();
      return true;
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: error.response?.data?.error || "Failed to save group",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGroup = async (groupId: number) => {
    setIsLoading(true);
    try {
      await deleteGroupAPI(groupId);
      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "Group deleted successfully",
      });
      await loadGroups();
      return true;
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: error.response?.data?.error || "Failed to delete group",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkActivate = async (groupIds: number[]) => {
    setIsLoading(true);
    try {
      await Promise.all(
        groupIds.map((groupId) => updateGroupAPI(groupId, { is_active: true }))
      );
      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message: `${groupIds.length} group(s) activated`,
      });
      await loadGroups();
      setSelectedGroups([]);
      return true;
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: error.response?.data?.error || "Failed to activate groups",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDeactivate = async (groupIds: number[]) => {
    setIsLoading(true);
    try {
      await Promise.all(
        groupIds.map((groupId) => updateGroupAPI(groupId, { is_active: false }))
      );
      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message: `${groupIds.length} group(s) deactivated`,
      });
      await loadGroups();
      setSelectedGroups([]);
      return true;
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: error.response?.data?.error || "Failed to deactivate groups",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGroupSelection = (groupId: number) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleAllGroups = () => {
    if (selectedGroups.length === groups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(groups.map((g) => g.id));
    }
  };

  return {
    groups,
    selectedGroups,
    isLoading,
    notification,
    setNotification,
    createGroup,
    updateGroup,
    deleteGroup,
    bulkActivate,
    bulkDeactivate,
    toggleGroupSelection,
    toggleAllGroups,
  };
};


