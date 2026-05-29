import React from "react";
import { motion } from "framer-motion";
import { NetworkFolder } from "../../types";
import { useAppSelector } from "../../../../store";
import { FileSpreadsheet, Download, Search, X, Map } from "lucide-react";

interface InfrastructureHeaderProps {
  breadcrumbs: NetworkFolder[];
  onOpenGlobalMap: () => void;
  onOpenCreateModal: () => void;
  onImport: (folder: NetworkFolder) => void;
  onOpenExportTool: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const InfrastructureHeader: React.FC<InfrastructureHeaderProps> = ({
  breadcrumbs,
  onOpenGlobalMap,
  onOpenCreateModal,
  onImport,
  onOpenExportTool,
  searchQuery,
  onSearchChange,
}) => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mt-2 mb-6 gap-4">
      {/* Search Bar - High Density GIS Style */}
      <div className="relative w-full lg:max-w-md group shadow-sm rounded-xl">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <motion.div
            animate={searchQuery ? { 
              scale: [1, 1.15, 1],
              opacity: [0.8, 1, 0.8],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            } : { scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
          >
            <Search className={`h-5 w-5 transition-colors ${searchQuery ? 'text-blue-500 shadow-sm' : 'text-indigo-600 dark:text-blue-400 opacity-90'}`} />
          </motion.div>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search folders or files..."
          className="block w-full h-11 pl-11 pr-10 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-xl text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
        {/* Export Tool */}
        {(user?.permissions?.includes("network:tools:export" as any) || user?.directPermissions?.includes("network:tools:export")) && (
           <button
             onClick={onOpenExportTool}
             className="px-4 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
           >
             <Download className="w-5 h-5 text-indigo-500" />
             <span className="hidden lg:inline">Export</span>
           </button>
        )}


        <button
          onClick={onOpenGlobalMap}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
        >
          <Map className="w-5 h-5 text-emerald-500" />
          <span className="hidden sm:inline">Map View</span>
        </button>

        {(user?.permissions?.includes("network:folder:create" as any) || user?.directPermissions?.includes("network:folder:create")) && (
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">New Folder</span>
          </button>
        )}

        {/* Import Button - Visible when inside any folder and user has permission */}
        {breadcrumbs.length > 0 &&
          (user?.permissions?.includes("network:file:import" as any) || user?.directPermissions?.includes("network:file:import")) && (
            <button
              onClick={() => onImport(breadcrumbs[breadcrumbs.length - 1])}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Import File
            </button>
          )}
      </div>
    </div>
  );
};

