import React, { useState } from "react";
import { ChevronRight, ChevronDown, FolderOpen, Folder } from "lucide-react";
import { FolderItem } from "../../../network-planning/types";

export interface FolderAccessTreeProps {
  folder: FolderItem;
  assignedFolderIds: number[];
  onToggle: (folderId: number, checked: boolean) => void;
  depth?: number;
}

export const FolderAccessTree: React.FC<FolderAccessTreeProps> = ({
  folder,
  assignedFolderIds,
  onToggle,
  depth = 0,
}) => {
  const [expanded, setExpanded] = useState(depth < 1); // Expand root by default

  const isChecked = assignedFolderIds.includes(folder.id);

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent expand toggle
    onToggle(folder.id, e.target.checked);
  };

  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div className="flex flex-col select-none">
      <div
        className={`group flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200 ${
          isChecked ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
        } ${
          depth > 0
            ? "ml-4 border-l border-gray-100 dark:border-gray-800 pl-3"
            : ""
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {/* Expand Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            disabled={!hasChildren}
            className={`p-0.5 rounded-md transition-colors ${
              hasChildren
                ? "hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-gray-400"
                : "opacity-0 cursor-default"
            }`}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheck}
            className="w-5 h-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          />

          {/* Icon & Name */}
          <div
            className="flex items-center gap-2 overflow-hidden cursor-pointer flex-1"
            onClick={() => hasChildren && setExpanded(!expanded)}
          >
            {expanded ? (
              <FolderOpen
                className={`w-4 h-4 ${isChecked ? "text-indigo-500" : "text-gray-400"}`}
              />
            ) : (
              <Folder
                className={`w-4 h-4 ${isChecked ? "text-indigo-500" : "text-gray-400"}`}
              />
            )}

            <span
              className={`text-sm ${isChecked ? "font-medium text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}`}
            >
              {folder.name}
            </span>

            {/* Regions Badge */}
            {(folder as any).regionCount != null && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full whitespace-nowrap">
                {(folder as any).regionCount} regions
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Children Recursion */}
      {hasChildren && expanded && (
        <div className="mt-0.5">
          {folder.children!.map((child) => (
            <FolderAccessTree
              key={child.id}
              folder={child}
              assignedFolderIds={assignedFolderIds}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

