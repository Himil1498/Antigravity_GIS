import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import InfrastructureManager from "../features/network-planning/components/InfrastructureManager";
import InfrastructureWorkspace from "../features/network-planning/components/InfrastructureManager/InfrastructureWorkspace";
import InfraApprovalDashboard from "../features/network-planning/components/InfrastructureManager/InfraApprovalDashboard";
import RecycleBinPanel from "../features/network-planning/components/RecycleBin/RecycleBinPanel";
import { useAppSelector } from "../store";
import { rolesMatch } from "../utils/rbac/helpers";
import { Network, Layers, PlusCircle, Trash2, CheckCircle } from "lucide-react";

const NetworkPlanningPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Define icon variants for hover consistency
  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: {
      scale: 1.15,
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 },
    },
  };

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
    return (
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
    <div className="transition-colors duration-300 flex flex-col flex-1">
      {/* Header / Tab Navigation */}
      <div
        className="bg-white dark:bg-gray-800 border-b border-gray-200/60 dark:border-gray-700/60 shrink-0 relative sticky top-16 z-30"
        style={{
          boxShadow: `
            0 2px 8px rgba(0,0,0,0.06),
            0 6px 24px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,1),
            inset 0 -1px 2px rgba(0,0,0,0.03)
          `,
        }}
      >
        {/* Glossy top-edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-[60%] pointer-events-none z-0 bg-gradient-to-b from-white/60 to-transparent dark:from-white/5" />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-[1]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-5 gap-4">
            <div className="flex items-center space-x-3">
              <motion.div
                className="flex items-center justify-center cursor-pointer"
                initial="idle"
                whileHover="hover"
              >
                <div
                  className="h-10 w-10 rounded-lg bg-purple-600 dark:bg-purple-500 flex items-center justify-center"
                  style={{
                    boxShadow: `
                      0 3px 10px rgba(0,0,0,0.2),
                      0 1px 3px rgba(0,0,0,0.15),
                      inset 0 1px 2px rgba(255,255,255,0.3),
                      inset 0 -2px 4px rgba(0,0,0,0.12)
                    `,
                  }}
                >
                  <motion.div variants={iconVariants}>
                    <Network className="h-5 w-5 text-white" />
                  </motion.div>
                </div>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  Network Planning
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage network infrastructure and customer outcomes
                </p>
              </div>
            </div>

            <div
              className="relative flex overflow-hidden rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60"
              style={{
                boxShadow: `
                  inset 0 2px 4px rgba(0,0,0,0.06),
                  0 1px 3px rgba(0,0,0,0.08),
                  0 4px 12px rgba(0,0,0,0.04)
                `,
                padding: "5px",
              }}
            >
              <nav className="flex items-center gap-1 px-1 overflow-x-auto scrollbar-hide">
                {canViewInfra && (
                  <motion.button
                    onClick={() => setActiveTab("infrastructure")}
                    whileTap={{ scale: 0.96, y: 1 }}
                    whileHover={
                      activeTab !== "infrastructure"
                        ? { y: -1, scale: 1.02 }
                        : {}
                    }
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap cursor-pointer select-none z-10 transition-colors duration-200 ${
                      activeTab === "infrastructure"
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <motion.span
                      className={`${activeTab === "infrastructure" ? "text-white" : "text-indigo-500"} flex-shrink-0 relative z-20`}
                      variants={iconVariants}
                      initial="idle"
                      whileHover="hover"
                      animate={
                        activeTab === "infrastructure"
                          ? {
                              scale: [1, 1.03, 1],
                              transition: { duration: 2, repeat: Infinity },
                            }
                          : "idle"
                      }
                    >
                      <Layers className="w-5 h-5" />
                    </motion.span>
                    <span
                      className={`relative z-20 px-1 ${activeTab === "infrastructure" ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}
                    >
                      Infrastructure Items
                    </span>
                    {activeTab === "infrastructure" && (
                      <>
                        <motion.div
                          layoutId="np-pill-color"
                          className="absolute inset-0 rounded-full -z-10 bg-indigo-500"
                          initial={false}
                          transition={{
                            layout: {
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            },
                          }}
                          style={{
                            boxShadow:
                              "0 3px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.12)",
                          }}
                        />
                        <motion.div
                          layoutId="np-pill-gloss"
                          className="absolute inset-0 rounded-full -z-[5] pointer-events-none"
                          initial={false}
                          transition={{
                            layout: {
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            },
                          }}
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)",
                          }}
                        />
                      </>
                    )}
                  </motion.button>
                )}
                {canAddInfra && (
                  <motion.button
                    onClick={() => setActiveTab("add-infrastructure")}
                    whileTap={{ scale: 0.96, y: 1 }}
                    whileHover={
                      activeTab !== "add-infrastructure"
                        ? { y: -1, scale: 1.02 }
                        : {}
                    }
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap cursor-pointer select-none z-10 transition-colors duration-200 ${
                      activeTab === "add-infrastructure"
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <motion.span
                      className={`${activeTab === "add-infrastructure" ? "text-white" : "text-amber-500"} flex-shrink-0 relative z-20`}
                      variants={iconVariants}
                      initial="idle"
                      whileHover="hover"
                      animate={
                        activeTab === "add-infrastructure"
                          ? {
                              scale: [1, 1.03, 1],
                              transition: { duration: 2, repeat: Infinity },
                            }
                          : "idle"
                      }
                    >
                      <PlusCircle className="w-5 h-5" />
                    </motion.span>
                    <span
                      className={`relative z-20 px-1 ${activeTab === "add-infrastructure" ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}
                    >
                      Add New Inventory
                    </span>
                    {activeTab === "add-infrastructure" && (
                      <>
                        <motion.div
                          layoutId="np-pill-color"
                          className="absolute inset-0 rounded-full -z-10 bg-amber-500"
                          initial={false}
                          transition={{
                            layout: {
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            },
                          }}
                          style={{
                            boxShadow:
                              "0 3px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.12)",
                          }}
                        />
                        <motion.div
                          layoutId="np-pill-gloss"
                          className="absolute inset-0 rounded-full -z-[5] pointer-events-none"
                          initial={false}
                          transition={{
                            layout: {
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            },
                          }}
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)",
                          }}
                        />
                      </>
                    )}
                  </motion.button>
                )}
                {canApproveInfra && (
                  <motion.button
                    onClick={() => setActiveTab("approvals")}
                    whileTap={{ scale: 0.96, y: 1 }}
                    whileHover={
                      activeTab !== "approvals" ? { y: -1, scale: 1.02 } : {}
                    }
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap cursor-pointer select-none z-10 transition-colors duration-200 ${
                      activeTab === "approvals"
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <motion.span
                      className={`${activeTab === "approvals" ? "text-white" : "text-emerald-500"} flex-shrink-0 relative z-20`}
                      variants={iconVariants}
                      initial="idle"
                      whileHover="hover"
                      animate={
                        activeTab === "approvals"
                          ? {
                              scale: [1, 1.03, 1],
                              transition: { duration: 2, repeat: Infinity },
                            }
                          : "idle"
                      }
                    >
                      <CheckCircle className="w-5 h-5" />
                    </motion.span>
                    <span
                      className={`relative z-20 px-1 ${activeTab === "approvals" ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}
                    >
                      Approvals
                    </span>
                    {activeTab === "approvals" && (
                      <>
                        <motion.div
                          layoutId="np-pill-color"
                          className="absolute inset-0 rounded-full -z-10 bg-emerald-500"
                          initial={false}
                          transition={{
                            layout: {
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            },
                          }}
                          style={{
                            boxShadow:
                              "0 3px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.12)",
                          }}
                        />
                        <motion.div
                          layoutId="np-pill-gloss"
                          className="absolute inset-0 rounded-full -z-[5] pointer-events-none"
                          initial={false}
                          transition={{
                            layout: {
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            },
                          }}
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)",
                          }}
                        />
                      </>
                    )}
                  </motion.button>
                )}
                {canAccessRecycleBin && (
                  <motion.button
                    onClick={() => setActiveTab("recycle-bin")}
                    whileTap={{ scale: 0.96, y: 1 }}
                    whileHover={
                      activeTab !== "recycle-bin" ? { y: -1, scale: 1.02 } : {}
                    }
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap cursor-pointer select-none z-10 transition-colors duration-200 ${
                      activeTab === "recycle-bin"
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <motion.span
                      className={`${activeTab === "recycle-bin" ? "text-white" : "text-rose-500"} flex-shrink-0 relative z-20`}
                      variants={iconVariants}
                      initial="idle"
                      whileHover="hover"
                      animate={
                        activeTab === "recycle-bin"
                          ? {
                              scale: [1, 1.03, 1],
                              transition: { duration: 2, repeat: Infinity },
                            }
                          : "idle"
                      }
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.span>
                    <span
                      className={`relative z-20 px-1 ${activeTab === "recycle-bin" ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}
                    >
                      Recycle Bin
                    </span>
                    {activeTab === "recycle-bin" && (
                      <>
                        <motion.div
                          layoutId="np-pill-color"
                          className="absolute inset-0 rounded-full -z-10 bg-rose-500"
                          initial={false}
                          transition={{
                            layout: {
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            },
                          }}
                          style={{
                            boxShadow:
                              "0 3px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.12)",
                          }}
                        />
                        <motion.div
                          layoutId="np-pill-gloss"
                          className="absolute inset-0 rounded-full -z-[5] pointer-events-none"
                          initial={false}
                          transition={{
                            layout: {
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            },
                          }}
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)",
                          }}
                        />
                      </>
                    )}
                  </motion.button>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>

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
