import React from "react";
import { NetworkFile } from "../../types";
import { ICON_DEFS, getIconColor } from "../NetworkMap/MapIcons";

// Helper to convert array color to CSS string
const getCssColor = (id: string) => {
  const [r, g, b, a] = getIconColor(id);
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

interface FileListProps {
  files: NetworkFile[];
  onDelete: (file: NetworkFile) => void;
  onViewOnMap?: (file: NetworkFile) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onDelete,
  onViewOnMap,
}) => {
  return (
    <div className="mt-8">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 flex items-center justify-between">
        Uploaded Files ({files.length})
      </h4>

      {files.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No files uploaded yet
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {files.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* File Type Icon (KML/KMZ) */}
                      <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-xs font-bold uppercase">
                          {file.file_type}
                        </span>
                      </div>
                      <div
                        className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]"
                        title={file.name}
                      >
                        {file.name}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                        {/* DEBUG: Log icon type */}
                        {ICON_DEFS[
                          file.icon_type?.toUpperCase().replace(" ", "-") ||
                            "DEFAULT"
                        ] ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                            fill={getCssColor(file.icon_type || "default")}
                          >
                            <path
                              d={
                                ICON_DEFS[
                                  file.icon_type
                                    ?.toUpperCase()
                                    .replace(" ", "-") || "DEFAULT"
                                ].path
                              }
                            />
                          </svg>
                        ) : (
                          <span className="text-sm font-bold text-gray-400">
                            ?
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize font-medium">
                        {file.icon_type?.replace("-", " ") || "Default"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col">
                      <span>
                        {new Date(file.created_at || "").toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(file.created_at || "").toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-xs font-semibold mt-1 ${
                          file.processing_status === "completed"
                            ? "text-green-600"
                            : file.processing_status === "failed"
                              ? "text-red-500"
                              : "text-amber-500 animate-pulse"
                        }`}
                      >
                        {file.processing_status === "completed"
                          ? "Ready"
                          : file.processing_status === "failed"
                            ? "Failed"
                            : "Processing..."}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatSize(Number(file.size_bytes || 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {onViewOnMap && (
                        <button
                          onClick={() => onViewOnMap(file)}
                          disabled={file.processing_status !== "completed"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            file.processing_status === "completed"
                              ? "text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                              : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          }`}
                          title={
                            file.processing_status === "completed"
                              ? "View on Map"
                              : "Processing..."
                          }
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
                              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(file)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete File"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};