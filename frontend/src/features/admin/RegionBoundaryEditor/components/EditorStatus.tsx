import React from "react";

interface EditorStatusProps {
  vertexCount: number;
  loading: boolean;
  editMode: boolean;
}

export const EditorStatus: React.FC<EditorStatusProps> = ({
  vertexCount,
  loading,
  editMode,
}) => {
  return (
    <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
      {/* Loading Indicator */}
      {loading && (
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/20">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
            Syncing...
          </span>
        </div>
      )}


      {/* Info Card */}
      <div className="w-48 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg rounded-xl px-3 py-2 border border-white/20 dark:border-gray-700/50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
            Vertices
          </span>
          <span className="text-sm font-bold text-gray-800 dark:text-white tabular-nums leading-tight">
            {vertexCount.toLocaleString()}
          </span>
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

        <div className="flex flex-col">
          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
            Status
          </span>
          <div className="flex items-center gap-1">
            <div
              className={`w-1.5 h-1.5 rounded-full ${editMode ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`}
            ></div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-tight">
              {editMode ? "Unpublished" : "Live"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
