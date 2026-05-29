import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PlusCircle, Clock } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup, Variants } from "framer-motion";
import AddInfrastructureForm from "./AddInfrastructureForm";
import MySubmissionsList from "./MySubmissionsList";

type TabType = "new" | "history";

const InfrastructureWorkspace: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionFromUrl = searchParams.get("section") as TabType | null;
  const activeTab = sectionFromUrl || "new";

  const setActiveTab = useCallback((section: TabType) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("section", section);
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Enforce 'section=new' as the default URL state if missing
  useEffect(() => {
    if (!searchParams.has("section")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("section", "new");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Update document title for context
  useEffect(() => {
    const title = activeTab === "history" ? "My Submissions" : "Add New Inventory";
    document.title = `${title} | OptiConnect GIS`;
    
    return () => {
      document.title = "OptiConnect GIS";
    };
  }, [activeTab]);
  
  // State to hold data when "Edit & Resubmit" is clicked from the History tab
  const [editingData, setEditingData] = useState<{ id: number, data: any } | null>(null);

  // Define icon variants for hover consistency
  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: { 
      scale: 1.15, 
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 }
    }
  };

  const handleEditRequest = (id: number, data: any) => {
    setEditingData({ id, data });
    setActiveTab("new");
  };

  const clearEditRequest = () => {
    setEditingData(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Unified Integrated Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Shared Integrated Header */}
        <div className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-violet-700 dark:text-violet-400 tracking-tight">
              {activeTab === "new" ? (editingData ? "Edit Submission" : "Add New Inventory") : "Submission History"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeTab === "new" 
                ? "Register and configure new network assets across your infrastructure." 
                : "Track and manage your previously submitted infrastructure requests."}
            </p>
          </div>

          <div className="flex items-center">
            {/* 3D Tab Switcher */}
            <div
              className="relative flex overflow-hidden rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60"
              style={{
                boxShadow: `
                  inset 0 2px 4px rgba(0,0,0,0.06),
                  0 1px 3px rgba(0,0,0,0.08),
                  0 4px 12px rgba(0,0,0,0.04)
                `,
                padding: '5px',
              }}
            >
              <nav className="flex items-center gap-1 px-1 overflow-x-auto scrollbar-hide">
                <motion.button
                  onClick={() => {
                    setActiveTab("new");
                    if (!editingData) clearEditRequest();
                  }}
                  whileTap={{ scale: 0.96, y: 1 }}
                  whileHover={activeTab !== "new" ? { y: -1, scale: 1.02 } : {}}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`relative flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-full whitespace-nowrap cursor-pointer select-none z-10 transition-colors duration-200 ${
                    activeTab === "new"
                      ? "text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  <motion.span
                    className={`${activeTab === "new" ? "text-white" : "text-indigo-500"} flex-shrink-0 relative z-20`}
                    variants={iconVariants}
                    initial="idle"
                    whileHover="hover"
                    animate={activeTab === "new" ? { scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity } } : "idle"}
                  >
                    <PlusCircle className="w-5 h-5" />
                  </motion.span>
                  <span className={`relative z-20 px-1 ${activeTab === "new" ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}>
                    {editingData ? "Edit Submission" : "Create New"}
                  </span>
                  {activeTab === "new" && (
                    <>
                      <motion.div layoutId="infra-pill-color" className="absolute inset-0 rounded-full -z-10 bg-indigo-500" initial={false} transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }} style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.12)' }} />
                      <motion.div layoutId="infra-pill-gloss" className="absolute inset-0 rounded-full -z-[5] pointer-events-none" initial={false} transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }} style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)' }} />
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab("history")}
                  disabled={!!editingData}
                  whileTap={!!editingData ? {} : { scale: 0.96, y: 1 }}
                  whileHover={activeTab !== "history" && !editingData ? { y: -1, scale: 1.02 } : {}}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`relative flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-full whitespace-nowrap cursor-pointer select-none z-10 transition-colors duration-200 ${
                    activeTab === "history"
                      ? "text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  } ${!!editingData ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <motion.span
                    className={`${activeTab === "history" ? "text-white" : "text-emerald-500"} flex-shrink-0 relative z-20`}
                    variants={iconVariants}
                    initial="idle"
                    whileHover="hover"
                    animate={activeTab === "history" ? { scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity } } : "idle"}
                  >
                    <Clock className="w-5 h-5" />
                  </motion.span>
                  <span className={`relative z-20 px-1 ${activeTab === "history" ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}>My Submissions</span>
                  {activeTab === "history" && (
                    <>
                      <motion.div layoutId="infra-pill-color" className="absolute inset-0 rounded-full -z-10 bg-emerald-600" initial={false} transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }} style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.12)' }} />
                      <motion.div layoutId="infra-pill-gloss" className="absolute inset-0 rounded-full -z-[5] pointer-events-none" initial={false} transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }} style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)' }} />
                    </>
                  )}
                </motion.button>
              </nav>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="p-0 sm:p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "new" ? (
              <motion.div 
                key="new-infra"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <AddInfrastructureForm 
                  editingSubmissionId={editingData?.id || null}
                  initialData={editingData?.data || null}
                  onCancelEdit={clearEditRequest}
                  onSuccess={() => {
                    clearEditRequest();
                    setActiveTab("history");
                  }}
                  hideHeader={true}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="history-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <MySubmissionsList 
                  onEditRequest={handleEditRequest} 
                  hideHeader={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureWorkspace;
