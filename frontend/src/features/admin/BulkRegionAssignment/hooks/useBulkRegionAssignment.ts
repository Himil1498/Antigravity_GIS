import { useState, useEffect } from "react";
import { useAppSelector } from "../../../../store/index";
import { INDIAN_STATES } from "../../../../utils/regionMapping/index";
import { logAuditEvent } from "../../../../services/audit/auditControlService";
import { getAllUsers } from "../../../../services/user/index";
import { bulkAssignRegions } from "../../../../services/user/userBulkService";
import { showToast, toastMessages } from "../../../../utils/toastUtils";
import { rolesMatch } from "../../../../utils/userHelpers";

import {
  BulkAssignmentUser,
  AssignmentAction,
  NotificationState,
} from "../types/types";

export const useBulkRegionAssignment = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<BulkAssignmentUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [action, setAction] = useState<AssignmentAction>("assign");
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const isAdmin = rolesMatch(user?.role, "Admin");

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = async () => {
    const USE_BACKEND = process.env.REACT_APP_USE_BACKEND === "true";

    if (USE_BACKEND) {
      try {
        const backendUsers = await getAllUsers();
        const mappedUsers: BulkAssignmentUser[] = backendUsers
          .filter((u: any) => u.role !== "Admin" && u.role !== "admin")
          .map((u: any) => ({
            id: u.id?.toString() || u.user_id || "",
            name: u.full_name || u.name || u.username || "",
            email: u.email || "",
            role: u.role || "User",
            assignedRegions: u.assignedRegions || u.regions || [],
          }));
        setUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to load users from backend:", error);
        loadUsersFromLocalStorage();
      }
    } else {
      loadUsersFromLocalStorage();
    }
  };

  const loadUsersFromLocalStorage = () => {
    try {
      const usersData = localStorage.getItem("users");
      if (usersData) {
        const parsedUsers: any[] = JSON.parse(usersData);
        const mappedUsers: BulkAssignmentUser[] = parsedUsers
          .filter((u) => u.role !== "Admin")
          .map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            assignedRegions: u.assignedRegions || [],
          }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Failed to load users from localStorage:", error);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region],
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const handleSelectAllRegions = () => {
    if (selectedRegions.length === INDIAN_STATES.length) {
      setSelectedRegions([]);
    } else {
      setSelectedRegions([...INDIAN_STATES]);
    }
  };

  const handleApplyBulkAssignment = async () => {
    if (selectedUsers.length === 0) {
      setNotification({
        isOpen: true,
        type: "warning",
        title: "No Users Selected",
        message: "Please select at least one user.",
      });
      return;
    }

    if (selectedRegions.length === 0) {
      setNotification({
        isOpen: true,
        type: "warning",
        title: "No Regions Selected",
        message: "Please select at least one region.",
      });
      return;
    }

    const USE_BACKEND = process.env.REACT_APP_USE_BACKEND === "true";

    if (USE_BACKEND) {
      try {
        await bulkAssignRegions(selectedUsers, selectedRegions, action);
        showToast.success(
          toastMessages.access.bulkAssigned(selectedUsers.length),
        );
        await loadUsers();

        window.dispatchEvent(
          new CustomEvent("userRegionsUpdated", {
            detail: {
              userIds: selectedUsers,
              regions: selectedRegions,
              action,
            },
          }),
        );

        setSelectedUsers([]);
        setSelectedRegions([]);

        if (user) {
          logAuditEvent(user, "REGION_ASSIGNED", `Bulk ${action} regions`, {
            severity: "info",
            details: {
              action,
              userCount: selectedUsers.length,
              regionCount: selectedRegions.length,
              regions: selectedRegions,
            },
            success: true,
          });
        }
      } catch (error: any) {
        console.error("Failed to apply bulk assignment:", error);
        setNotification({
          isOpen: true,
          type: "error",
          title: "Assignment Failed",
          message:
            error.message ||
            "Failed to apply bulk assignment. Please try again.",
        });
      }
      return;
    }

    const updatedUsers = users.map((u) => {
      if (!selectedUsers.includes(u.id)) {
        return u;
      }

      let newRegions: string[];

      switch (action) {
        case "assign":
          newRegions = Array.from(
            new Set([...u.assignedRegions, ...selectedRegions]),
          );
          break;
        case "revoke":
          newRegions = u.assignedRegions.filter(
            (r) => !selectedRegions.includes(r),
          );
          break;
        case "replace":
          newRegions = [...selectedRegions];
          break;
        default:
          newRegions = u.assignedRegions;
      }

      return {
        ...u,
        assignedRegions: newRegions,
      };
    });

    try {
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      // Re-filter to ensure type safety, though logic is consistent
      setUsers(updatedUsers as BulkAssignmentUser[]);

      selectedUsers.forEach((userId) => {
        const targetUser = users.find((u) => u.id === userId);
        if (targetUser && user) {
          logAuditEvent(
            user,
            "REGION_ASSIGNED",
            `Bulk ${action} regions for ${targetUser.name}`,
            {
              severity: "info",
              details: {
                targetUserId: userId,
                targetUserName: targetUser.name,
                targetUserEmail: targetUser.email,
                action,
                regions: selectedRegions,
              },
              success: true,
            },
          );
        }
      });

      setNotification({
        isOpen: true,
        type: "success",
        title: "Bulk Assignment Completed",
        message: `Successfully ${action}ed ${selectedRegions.length} region(s) for ${selectedUsers.length} user(s).`,
      });

      setSelectedUsers([]);
      setSelectedRegions([]);
    } catch (error) {
      console.error("Failed to save users:", error);
      setNotification({
        isOpen: true,
        type: "error",
        title: "Assignment Failed",
        message: "Failed to apply bulk assignment. Please try again.",
      });
    }
  };

  const closeNotification = () =>
    setNotification({ ...notification, isOpen: false });

  return {
    users,
    selectedUsers,
    selectedRegions,
    action,
    setAction,
    notification,
    isAdmin,
    handleUserToggle,
    handleRegionToggle,
    handleSelectAllUsers,
    handleSelectAllRegions,
    handleApplyBulkAssignment,
    closeNotification,
  };
};
