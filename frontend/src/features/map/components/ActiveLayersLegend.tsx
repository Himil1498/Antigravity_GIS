import React from "react";
import { X, Layers } from "lucide-react";
import { RenderMapIcon } from "../../../components/ui/RenderMapIcon";
import { getFolderIconKey } from "../../network-planning/components/NetworkMap/MapIcons";

// ... (Rest follows)

interface ActiveLayer {
  id: number;
  name: string;
  type?: "infrastructure" | "customer";
  iconType?: string;
  files?: { id: number; name: string; iconType?: string }[];
}

interface ActiveLayersLegendProps {
  activeLayers: ActiveLayer[];
  onRemoveFile: (id: number) => void;
  onRemoveFolder: (id: number) => void;
  onClearAll: () => void;
}

const ActiveLayersLegend: React.FC<ActiveLayersLegendProps> = ({
  activeLayers,
  onRemoveFile,
  onRemoveFolder,
  onClearAll,
}) => {
  if (activeLayers.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 max-w-[300px] animate-in fade-in slide-in-from-left-4 duration-300 pointer-events-auto">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
              Active Layers ({activeLayers.length})
            </span>
          </div>
          <button
            onClick={onClearAll}
            className="text-[10px] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-1.5 py-0.5 rounded transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* List */}
        <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar flex flex-col gap-2">
          {activeLayers.map((layer) => (
            <div
              key={layer.id}
              className={`group flex flex-col gap-1 px-3 py-2 rounded-lg border shadow-sm transition-all duration-200 ${
                layer.type === "customer"
                  ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30"
                  : "bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <RenderMapIcon
                    type={
                      getFolderIconKey({
                        name: layer.name,
                        default_icon: layer.iconType,
                      }) || // Smart Resolve from folder name first
                      layer.iconType ||
                      (layer.type === "customer" ? "CUSTOMER" : "LAYER-GROUP")
                    }
                    className="w-5 h-5 flex-shrink-0"
                  />
                  <span
                    className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate"
                    title={layer.name}
                  >
                    {layer.name}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveFolder(layer.id)}
                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Remove All in Folder"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Files List */}
              {layer.files && layer.files.length > 0 ? (
                <div className="pl-2 mt-1 space-y-1 border-l-2 border-dashed border-gray-200 dark:border-gray-700 ml-1.5">
                  {layer.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded"
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <RenderMapIcon
                          type={file.iconType || "DEFAULT"}
                          name={file.name}
                          className="w-4 h-4 flex-shrink-0"
                        />
                        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 truncate leading-tight">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveFile(file.id)}
                        className="text-gray-400 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove File"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pl-6 text-[10px] text-gray-400 italic">
                  No files in folder
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveLayersLegend;

