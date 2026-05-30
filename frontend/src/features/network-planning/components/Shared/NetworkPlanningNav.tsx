import React from "react";
import { motion, Variants } from "framer-motion";
import { Network, Layers, PlusCircle, Trash2, CheckCircle } from "lucide-react";

export type NetworkPlanningTab = "infrastructure" | "add-infrastructure" | "approvals" | "recycle-bin";

interface NetworkPlanningNavProps {
  activeTab: NetworkPlanningTab;
  setActiveTab: (tab: string) => void;
  canViewInfra: boolean;
  canAddInfra: boolean;
  canApproveInfra: boolean;
  canAccessRecycleBin: boolean;
}

export const NetworkPlanningNav: React.FC<NetworkPlanningNavProps> = ({
  activeTab,
  setActiveTab,
  canViewInfra,
  canAddInfra,
  canApproveInfra,
  canAccessRecycleBin,
}) => {
  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: {
      scale: 1.15,
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 },
    },
  };

  return (
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
  );
};
