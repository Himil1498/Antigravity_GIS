import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import InfrastructureManager from "../features/network-planning/components/InfrastructureManager";
import InfrastructureWorkspace from "../features/network-planning/components/InfrastructureManager/InfrastructureWorkspace";
import InfraApprovalDashboard from "../features/network-planning/components/InfrastructureManager/InfraApprovalDashboard";
import RecycleBinPanel from "../features/network-planning/components/RecycleBin/RecycleBinPanel";
import { NetworkPlanningNav, NetworkPlanningTab } from "../features/network-planning/components/Shared/NetworkPlanningNav";
import { useAppSelector } from "../store";
import { rolesMatch } from "../utils/rbac/helpers";

const NetworkPlanningPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useAppSelector((state) => state.auth);

  // Permission Checks
  console.log("NetworkPlanningPage Debug:", {
    role: user?.role,
    permissions: user?.directPermissions,
    hasView: user?.directPermissions?.includes("network:view"),
    isAdmin: rolesMatch(user?.role, "Admin"),
  });

  // Helper for permission checking
  const checkPermission = (perm: string) => {
    if (!user) return false;
    if (rolesMatch(user.role, "Admin")) return true;
    return !!(
      user.permissions?.includes(perm as any) ||
      user.directPermissions?.includes(perm)
    );
  };

  const hasPageAccess = checkPermission("network:view");

  const canViewInfra = checkPermission("network:infra:items");

  const canAddInfra = checkPermission("network:infra:add");

  const canApproveInfra = checkPermission("network:infra:approve");

  const canAccessRecycleBin =
    user &&
    (rolesMatch(user.role, "Admin") ||
      checkPermission("network:recycle_bin") ||
      rolesMatch(user.role, "Manager"));

  const activeTab = useMemo(() => {
    // 1. Explicit folder/file navigation
    if (searchParams.get("folderId") || searchParams.get("fileId"))
      return "infrastructure";

    // 2. User-selected tab via parameter
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      [
        "infrastructure",
        "add-infrastructure",
        "approvals",
        "recycle-bin",
      ].includes(tabParam)
    ) {
      return tabParam as any;
    }

    // Default
    return "infrastructure";
  }, [searchParams]);

  const setActiveTab = (newTab: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", newTab);

      // Clean up tab-specific nested states
      newParams.delete("section");
      newParams.delete("path");

      // If switching out of infrastructure, we preserve global parameters (like folderId, fileId, or view)
      return newParams;
    });
  };

  // Enforce default tab URL state if missing
  useEffect(() => {
    // Only set if no primary tab-triggering params exist
    if (
      !searchParams.has("tab") &&
      !searchParams.has("mode") &&
      !searchParams.get("folderId") &&
      !searchParams.get("fileId")
    ) {
      setActiveTab(activeTab);
    }
  }, [searchParams, activeTab]);

  // Adjust active tab if current is not allowed
  useEffect(() => {
    if (activeTab === "infrastructure" && !canViewInfra) {
      if (canAddInfra) setActiveTab("add-infrastructure");
    }
  }, [activeTab, canViewInfra, canAddInfra]);

  if (!hasPageAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Access Denied
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            You do not have permission to access Network Planning.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="transition-colors duration-300 flex flex-col flex-1 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-65px)]">
      <NetworkPlanningNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        canViewInfra={canViewInfra}
        canAddInfra={canAddInfra}
        canApproveInfra={canApproveInfra}
        canAccessRecycleBin={!!canAccessRecycleBin}
      />

      <div
        className={`mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4`}
      >
        {activeTab === "infrastructure" && canViewInfra ? (
          <InfrastructureManager />
        ) : activeTab === "recycle-bin" && canAccessRecycleBin ? (
          <RecycleBinPanel />
        ) : activeTab === "add-infrastructure" && canAddInfra ? (
          <InfrastructureWorkspace />
        ) : activeTab === "approvals" && canApproveInfra ? (
          <InfraApprovalDashboard />
        ) : (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center py-10 text-gray-500">
            Select a tab
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkPlanningPage;
