import React from "react";
import FolderCard from "./FolderCard";
import { NetworkFolder } from "../../types";
import { FolderOpen } from "lucide-react";

interface InfrastructureFolderGridProps {
  folders: NetworkFolder[];
  parentName?: string;
  onNavigate: (folderId: number, folderName?: string) => void;
  onImport: (folder: NetworkFolder) => void;
  onDeleteRequest?: (folder: NetworkFolder) => void;
  onCreateOpen: () => void;
  onRename?: (folder: NetworkFolder) => void;
  canRename?: boolean;
}

export const InfrastructureFolderGrid: React.FC<
  InfrastructureFolderGridProps
> = ({
  folders,
  parentName,
  onNavigate,
  onImport,
  onDeleteRequest,
  onCreateOpen,
  onRename,
  canRename = false,
}) => {
  // Compute summary stats
  const totalFeatures = folders?.reduce((sum, f) => sum + (Number(f.total_feature_count) || 0), 0) || 0;
  const liveCount = folders?.reduce((sum, f) => sum + (Number(f.status_counts?.live) || 0), 0) || 0;
  const plannedCount = folders?.reduce((sum, f) => sum + (Number(f.status_counts?.planned) || 0), 0) || 0;

  if (!folders || folders.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Section Header with quick stats */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Folders
          </h2>
          <span className="px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full ring-1 ring-indigo-200/50 dark:ring-indigo-800/40">
            {folders.length}
          </span>
        </div>

        {/* Quick stats ribbon */}
        {totalFeatures > 0 && (
          <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              {totalFeatures.toLocaleString()} features
            </span>
            {liveCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                {liveCount.toLocaleString()} live
              </span>
            )}
            {plannedCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {plannedCount.toLocaleString()} planned
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {folders.map((folder, index) => (
          <div
            key={folder.id}
            className="animate-fadeIn"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <FolderCard
              folder={folder}
              parentName={parentName}
              onClick={(folder) => onNavigate(folder.id, folder.name)}
              onImport={onImport}
              onDelete={onDeleteRequest}
              onRename={onRename}
              canRename={canRename}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
