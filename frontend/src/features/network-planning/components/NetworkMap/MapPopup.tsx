import React from "react";
import { RenderMapIcon } from "../../../../components/ui/RenderMapIcon";
import { PencilSquareIcon, TrashIcon, XMarkIcon } from "@heroicons/react/20/solid";

interface MapPopupProps {
  properties: Record<string, string>;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  actionFooter?: React.ReactNode;
}

const MapPopup: React.FC<MapPopupProps> = ({
  properties,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onClose,
  actionFooter,
}) => {
  // Handle nested stringified properties from MVT Layer
  const parsedNestedProperties = React.useMemo(() => {
    if (properties.properties && typeof properties.properties === "string") {
      try {
        return JSON.parse(properties.properties);
      } catch (e) {
        return {};
      }
    } else if (properties.properties && typeof properties.properties === "object") {
        return properties.properties;
    }
    return {};
  }, [properties]);

  const mergedProps = { ...properties, ...parsedNestedProperties };

  // Filter out internal/system properties
  const excludeKeys = [
    "layerName",
    "layerId",
    "userId",
    "fileId",
    "icon_type",
    "processing_status",
    "mapbox_id",
    "vt_layer",
    "properties", // Exclude the raw nested string
    "_resolved_icon" // Exclude our internal mapping key
  ];

  const entries = Object.entries(mergedProps).filter(([key, value]) => {
    return value !== null && value !== undefined && value !== "" && !excludeKeys.includes(key);
  });

  // Match the map marker logic: icon_type is the definitive resolved icon from backend
  const resolvedIconType = mergedProps._resolved_icon || mergedProps.icon_type || mergedProps.folder_name;

  return (
    <div className="w-full min-w-[260px] font-sans flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* ── Header (Premium Gradient) ── */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 p-3 pr-8 relative overflow-hidden">
        {/* Subtle background pattern/glow */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>
        
        {/* Custom Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-red-500 transition-all backdrop-blur-sm text-white z-20"
            title="Close"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex items-start gap-2.5 relative z-10">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md border border-white/20 shrink-0 shadow-inner">
            <RenderMapIcon
              type={resolvedIconType}
              name={properties.name}
              className="w-5 h-5 drop-shadow-md brightness-0 invert"
            />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="font-bold text-[13px] text-white leading-tight break-words pr-2">
              {properties.name || resolvedIconType || "Unknown Feature"}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1.5">
              <span className="px-1.5 py-0.5 bg-white/20 backdrop-blur-md text-[8px] font-bold text-white uppercase tracking-wider rounded border border-white/10 shadow-sm inline-flex items-center gap-1">
                {resolvedIconType}
              </span>
              {properties.status && (
                <span className="px-1.5 py-0.5 bg-white/20 backdrop-blur-md text-[8px] font-bold text-white uppercase tracking-wider rounded border border-white/10 shadow-sm inline-flex items-center gap-1">
                  {properties.status === "Active" || properties.status === "Live" ? (
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                  ) : null}
                  {properties.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content (Grid Layout) ── */}
      <div className="p-2 bg-white dark:bg-gray-800">
        <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar">
          {entries.length === 0 ? (
            <p className="text-gray-400 italic text-xs text-center py-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-dashed border-gray-200 dark:border-gray-700">
              No additional properties.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-y-1 gap-x-3">
              {entries.map(([key, value]) => {
                const label = key.replace(/_/g, " ");
                return (
                  <div key={key} className="flex flex-col group py-0.5 px-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                    <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono mb-px leading-none">
                      {label}
                    </span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 break-words leading-tight">
                      {String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Action Footer ── */}
      {actionFooter && (
        <div className="bg-gray-50/80 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
          {actionFooter}
        </div>
      )}

    </div>
  );
};

export default MapPopup;
