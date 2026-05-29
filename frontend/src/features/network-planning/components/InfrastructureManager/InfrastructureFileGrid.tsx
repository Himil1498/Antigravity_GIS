import React from "react";
import { NetworkFile } from "../../types";
import { ICON_DEFS } from "../NetworkMap/MapIcons";

interface InfrastructureFileGridProps {
  files: NetworkFile[];
  onViewDetails: (file: NetworkFile) => void;
}

export const InfrastructureFileGrid: React.FC<InfrastructureFileGridProps> = ({
  files,
  onViewDetails,
}) => {
  if (!files || files.length === 0) return null;

  const outcomeFiles = files.filter(
    (f) =>
      (f.properties && (f.properties as any).is_outcome) ||
      ((f as any).metadata && (f as any).metadata.is_outcome),
  );
  const rawFiles = files.filter(
    (f) =>
      !(
        (f.properties && (f.properties as any).is_outcome) ||
        ((f as any).metadata && (f as any).metadata.is_outcome)
      ),
  );

  return (
    <div className="space-y-8">
      {/* 1. Approved Data Section */}
      {outcomeFiles.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2">
            <span className="p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
              ✅
            </span>
            Approved Network Data
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {outcomeFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 rounded-xl border border-indigo-200 dark:border-indigo-700/50 flex items-center gap-3 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => onViewDetails(file)}
              >
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="truncate flex-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">
                      FEASIBLE LOCATIONS
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(file);
                  }}
                  className="relative group/info flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 active:scale-90 hover:scale-110"
                  title="View Details"
                >
                  {/* Vibrant Blue Jewel Orb */}
                  <div className="absolute inset-0 rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover/info:bg-blue-500 group-hover/info:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all duration-300" 
                    style={{
                      boxShadow: `
                        inset 0 1px 2px rgba(255,255,255,0.4),
                        inset 0 -1px 2px rgba(0,0,0,0.2),
                        0 4px 10px rgba(37,99,235,0.3)
                      `
                    }}
                  />
                  <svg
                    className="w-4 h-4 text-white drop-shadow-sm transition-transform duration-300 group-hover/info:rotate-12 relative z-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Raw Files Section */}
      {rawFiles.length > 0 && (
        <div>
          {outcomeFiles.length > 0 && (
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 mt-8 uppercase tracking-wider">
              Source Files
            </h2>
          )}
          {!outcomeFiles.length && (
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
              📄 Files ({files?.length || 0})
            </h2>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rawFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center min-w-[40px]">
                  {file.icon_type &&
                  (ICON_DEFS[(file.icon_type as string).toUpperCase()] ||
                    ICON_DEFS[file.icon_type]) ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                      fill={
                        ICON_DEFS[(file.icon_type as string).toUpperCase()]
                          ?.color
                          ? `rgb(${ICON_DEFS[(file.icon_type as string).toUpperCase()].color!.slice(0, 3).join(",")})`
                          : "currentColor"
                      }
                    >
                      <path
                        d={
                          ICON_DEFS[(file.icon_type as string).toUpperCase()]
                            .path
                        }
                      />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold">KML</span>
                  )}
                </div>
                <div className="truncate flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">
                      {file.icon_type
                        ? String(file.icon_type).charAt(0).toUpperCase() +
                          String(file.icon_type).slice(1).toLowerCase()
                        : "File"}
                    </p>
                    {file.processing_status &&
                      file.processing_status !== "completed" && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            file.processing_status === "failed"
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse"
                          }`}
                        >
                          {file.processing_status === "failed"
                            ? "Failed"
                            : "Processing"}
                        </span>
                      )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(file);
                  }}
                  className="relative group/info flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 active:scale-90 hover:scale-110"
                  title="View Details"
                >
                  {/* Vibrant Blue Jewel Orb */}
                  <div className="absolute inset-0 rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover/info:bg-blue-500 group-hover/info:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all duration-300" 
                    style={{
                      boxShadow: `
                        inset 0 1px 2px rgba(255,255,255,0.4),
                        inset 0 -1px 2px rgba(0,0,0,0.2),
                        0 4px 10px rgba(37,99,235,0.3)
                      `
                    }}
                  />
                  <svg
                    className="w-4 h-4 text-white drop-shadow-sm transition-transform duration-300 group-hover/info:rotate-12 relative z-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

