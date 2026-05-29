import React from "react";
import { NetworkFolder } from "../../types";
import { Folder, Trash2, Download, Eye, FolderOpen, Pencil, ChevronRight, MoreVertical } from "lucide-react";
import {
  ICON_DEFS,
  STATES_AND_UTS,
  getFolderIconKey,
} from "../NetworkMap/MapIcons";

interface FolderCardProps {
  folder: NetworkFolder;
  parentName?: string;
  onClick: (folder: NetworkFolder) => void;
  onImport: (folder: NetworkFolder) => void;
  onDelete?: (folder: NetworkFolder) => void;
  onRename?: (folder: NetworkFolder) => void;
  canRename?: boolean;
}

// Helper: Get RGB color string
const getIconColor = (def: any) => {
  if (def && def.color) {
    const [r, g, b] = def.color;
    return `rgb(${r},${g},${b})`;
  }
  return "currentColor";
};

// Helper: Determine status level from counts
const getStatusLevel = (folder: NetworkFolder): "live" | "planned" | "empty" => {
  if (folder.status_counts?.live && folder.status_counts.live > 0) return "live";
  if (folder.status_counts?.planned && folder.status_counts.planned > 0) return "planned";
  return "empty";
};

const STATUS_CONFIG = {
  live: {
    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
    label: "Live",
    accent: "from-emerald-500/10 via-transparent to-transparent",
    border: "border-emerald-200/50 dark:border-emerald-700/30",
  },
  planned: {
    dot: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]",
    label: "Planned",
    accent: "from-amber-500/10 via-transparent to-transparent",
    border: "border-amber-200/50 dark:border-amber-700/30",
  },
  empty: {
    dot: "bg-gray-300 dark:bg-gray-600",
    label: "Empty",
    accent: "from-gray-500/5 via-transparent to-transparent",
    border: "border-gray-200 dark:border-gray-700",
  },
};

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  parentName,
  onClick,
  onImport,
  onDelete,
  onRename,
  canRename = false,
}) => {
  const iconKey = getFolderIconKey(folder, parentName);
  const iconDef = iconKey ? ICON_DEFS[iconKey.toUpperCase()] : null;
  const statusLevel = getStatusLevel(folder);
  const status = STATUS_CONFIG[statusLevel];
  const hasData = folder.total_feature_count != null && folder.total_feature_count > 0;

  return (
    <div
      className="group relative flex flex-col bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer h-full"
      onClick={() => onClick(folder)}
    >
      {/* Glass Background */}
      
      {/* Top gradient accent based on status */}
      {hasData && (
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusLevel === 'live' ? 'from-emerald-400 via-emerald-500 to-teal-500' : statusLevel === 'planned' ? 'from-amber-400 via-orange-400 to-amber-500' : 'from-gray-300 to-gray-200'} rounded-t-2xl opacity-80 group-hover:opacity-100 transition-opacity`} />
      )}

      {/* Decorative glow on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:from-indigo-500/5 group-hover:via-indigo-500/10 group-hover:to-purple-500/5 transition-all duration-500 blur-xl -z-10" />

      {/* Card Content */}
      <div className="relative p-5 flex-1 z-10">
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div
            className={`relative p-3 rounded-xl shadow-sm ring-1 ring-inset transition-all duration-300 group-hover:shadow-md group-hover:scale-105 ${
              folder.is_system
                ? "bg-gradient-to-br from-blue-50 to-sky-100/80 text-blue-600 ring-blue-200/60 dark:from-blue-900/40 dark:to-blue-800/20 dark:text-blue-400 dark:ring-blue-800/40"
                : "bg-gradient-to-br from-indigo-50 to-violet-100/80 text-indigo-600 ring-indigo-200/60 dark:from-indigo-900/40 dark:to-indigo-800/20 dark:text-indigo-400 dark:ring-indigo-800/40"
            }`}
          >
            {iconDef && iconDef.imageUrl ? (
              <img
                src={iconDef.imageUrl}
                alt={folder.name || "Folder"}
                className="w-7 h-7"
                style={{ objectFit: "contain" }}
              />
            ) : iconDef ? (
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7"
                fill={getIconColor(iconDef)}
              >
                <path d={iconDef.path} />
              </svg>
            ) : folder.is_system ? (
              <FolderOpen className="w-7 h-7" strokeWidth={1.5} />
            ) : (
              <Folder className="w-7 h-7" strokeWidth={1.5} />
            )}
            
            {/* Status dot indicator */}
            {hasData && (
              <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${status.dot} ring-2 ring-white dark:ring-gray-800`} />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {canRename && folder.parent_id !== null && onRename && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(folder);
                }}
                className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                title="Rename Folder"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {!folder.is_system && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(folder);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Delete Folder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Folder name */}
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base truncate pr-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
          {folder.name}
        </h3>

        {/* Type label */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              folder.is_system ? "bg-blue-500" : "bg-indigo-500"
            }`}
          />
          {folder.is_system ? "System Folder" : "User Folder"}
        </p>

        {/* Stats badges */}
        {hasData && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {/* Total */}
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9.5px] uppercase tracking-wider font-bold bg-gradient-to-b from-indigo-50 to-indigo-100 dark:from-indigo-900/60 dark:to-indigo-800/80 text-indigo-800 dark:text-indigo-200 border-t border-white dark:border-indigo-700 shadow-[0_2px_0_rgb(199,210,254),0_3px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_0_rgb(49,46,129),0_3px_3px_rgba(0,0,0,0.2)] transform hover:-translate-y-0.5 transition-transform">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-[pulse_2s_ease-in-out_infinite]" />
              <span className="font-mono text-[10.5px]">{folder.total_feature_count!.toLocaleString()}</span> Total
            </span>
            {/* Live */}
            {folder.status_counts?.live != null && folder.status_counts.live > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9.5px] uppercase tracking-wider font-bold bg-gradient-to-b from-emerald-50 to-emerald-100 dark:from-emerald-900/60 dark:to-emerald-800/80 text-emerald-800 dark:text-emerald-200 border-t border-white dark:border-emerald-700 shadow-[0_2px_0_rgb(167,243,208),0_3px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_0_rgb(6,78,59),0_3px_3px_rgba(0,0,0,0.2)] transform hover:-translate-y-0.5 transition-transform">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-[pulse_2s_ease-in-out_infinite]" />
                <span className="font-mono text-[10.5px]">{folder.status_counts.live.toLocaleString()}</span> Live
              </span>
            )}
            {/* Planned */}
            {folder.status_counts?.planned != null && folder.status_counts.planned > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9.5px] uppercase tracking-wider font-bold bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900/60 dark:to-amber-800/80 text-amber-800 dark:text-amber-200 border-t border-white dark:border-amber-700 shadow-[0_2px_0_rgb(253,230,138),0_3px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_0_rgb(120,53,15),0_3px_3px_rgba(0,0,0,0.2)] transform hover:-translate-y-0.5 transition-transform">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="font-mono text-[10.5px]">{folder.status_counts.planned.toLocaleString()}</span> Planned
              </span>
            )}
            {/* Imported */}
            {folder.status_counts?.imported != null && folder.status_counts.imported > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9.5px] uppercase tracking-wider font-bold bg-gradient-to-b from-violet-50 to-violet-100 dark:from-violet-900/60 dark:to-violet-800/80 text-violet-800 dark:text-violet-200 border-t border-white dark:border-violet-700 shadow-[0_2px_0_rgb(221,214,254),0_3px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_0_rgb(76,29,149),0_3px_3px_rgba(0,0,0,0.2)] transform hover:-translate-y-0.5 transition-transform">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <span className="font-mono text-[10.5px]">{folder.status_counts.imported.toLocaleString()}</span> Imported
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      {!folder.is_system && (
        <div className="relative z-10 px-4 pb-4 mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onImport(folder);
            }}
            className="w-full py-2.5 px-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 ring-1 ring-indigo-200/50 dark:ring-indigo-800/30 rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-md active:scale-[0.98] group/btn"
          >
            <Download className="w-4 h-4 group-hover/btn:animate-bounce" />
            Import KML/KMZ
          </button>
        </div>
      )}
    </div>
  );
};

export default FolderCard;
