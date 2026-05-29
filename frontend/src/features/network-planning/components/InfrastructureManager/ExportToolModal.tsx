import React, { useState, useCallback } from "react";
// @ts-ignore
import { saveAs } from "file-saver";
import {
  X,
  Download,
  Database,
  FileText,
  Folder,
  ChevronRight,
  ChevronDown,
  File as FileIcon,
  CheckCircle2,
} from "lucide-react";
import { networkPlanningService } from "../../services/api";
import { NetworkFolder, NetworkFile } from "../../types";
import { showToast } from "../../../../utils/toastUtils";
import { getFolderIconKey, ICON_DEFS } from "../NetworkMap/MapIcons";

interface ExportToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId: number | null;
}

export const ExportToolModal: React.FC<ExportToolModalProps> = ({
  isOpen,
  onClose,
  currentFolderId,
}) => {
  const [outputType, setOutputType] = useState<"kml" | "kmz">("kmz");
  const [exportMode, setExportMode] = useState<"merged" | "individual">(
    "merged",
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const [treeData, setTreeData] = useState<{
    folders: NetworkFolder[];
    files: NetworkFile[];
  }>({ folders: [], files: [] });
  const [expandedFolders, setExpandedFolders] = useState<
    Record<number, boolean>
  >({});
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      networkPlanningService
        .getWorkspaceTree()
        .then((data) => {
          setTreeData(data);
          // Expand root folders by default
          const initialExpanded: Record<number, boolean> = {};
          data.folders
            .filter((f) => f.parent_id === null)
            .forEach((f) => {
              initialExpanded[f.id] = true;
            });
          setExpandedFolders(initialExpanded);
        })
        .catch(console.error);
    } else {
      setSelectedFiles([]);
      setExpandedFolders({});
    }
  }, [isOpen]);

  const getFilesInFolder = useCallback(
    (folderId: number | null): number[] => {
      let ids: number[] = [];
      const directFiles = treeData.files
        .filter((f) => f.folder_id === folderId)
        .map((f) => f.id);
      ids.push(...directFiles);
      const subFolders = treeData.folders.filter(
        (f) => f.parent_id === folderId,
      );
      for (const sf of subFolders) {
        ids.push(...getFilesInFolder(sf.id));
      }
      return ids;
    },
    [treeData],
  );

  const handleFolderToggle = (folderId: number | null, checked: boolean) => {
    const fileIds = getFilesInFolder(folderId);
    if (checked) {
      setSelectedFiles((prev) => Array.from(new Set([...prev, ...fileIds])));
    } else {
      setSelectedFiles((prev) => prev.filter((id) => !fileIds.includes(id)));
    }
  };

  const getFolderSelectionState = (folderId: number | null) => {
    const fileIds = getFilesInFolder(folderId);
    if (fileIds.length === 0) return { selected: false, indeterminate: false };
    const selectedCount = fileIds.filter((id) =>
      selectedFiles.includes(id),
    ).length;
    return {
      selected: selectedCount === fileIds.length,
      indeterminate: selectedCount > 0 && selectedCount < fileIds.length,
    };
  };

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const blob = await networkPlanningService.exportCombinedData({
        specificFolders: [],
        specificFiles: selectedFiles,
        format: exportMode === "individual" ? "kmz" : outputType,
        exportMode,
      });

      const extension = exportMode === "individual" ? "zip" : outputType;
      const fileNameSuffix =
        exportMode === "individual" ? "Individual" : "Merged";
      saveAs(
        blob as Blob,
        `Exported_Network_Data_${fileNameSuffix}.${extension}`,
      );
      showToast.success(
        `Successfully exported ${selectedFiles.length} file(s)!`,
      );
      onClose();
    } catch (err) {
      console.error("Export failed", err);
      showToast.error("Export failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] border border-gray-200 dark:border-gray-700 flex flex-col transition-all transform scale-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-md z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Export Network Data
              </h3>
              <p className="text-sm text-gray-500 font-medium mt-0.5">
                Select folders and files to combine into a single export.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-500 hover:text-white text-gray-400 dark:hover:bg-red-500 dark:hover:text-white rounded-xl transition-all duration-300 group shadow-sm"
          >
            <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-h-0 bg-gray-50/50 dark:bg-gray-900/50">
          {/* Main Workspace Tree */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm min-h-[250px] flex flex-col">
              {(() => {
                const renderTree = (
                  parentId: number | null,
                  level: number = 0,
                ) => {
                  const folders = treeData.folders.filter(
                    (f) => f.parent_id === parentId,
                  );
                  const files = treeData.files.filter(
                    (f) => f.folder_id === parentId,
                  );

                  if (folders.length === 0 && files.length === 0) return null;

                  return (
                    <div
                      className="flex flex-col gap-0.5"
                      style={{ paddingLeft: level === 0 ? "0px" : "24px" }}
                    >
                      {folders.map((folder) => {
                        const isExpanded = expandedFolders[folder.id];
                        const { selected, indeterminate } =
                          getFolderSelectionState(folder.id);

                        const fileIds = getFilesInFolder(folder.id);
                        const totalFiles = fileIds.length;
                        const isEmpty = totalFiles === 0;

                        const iconKey = getFolderIconKey({ name: folder.name });
                        const iconDef = iconKey
                          ? ICON_DEFS[iconKey.toUpperCase()]
                          : null;
                        const iconColor = iconDef?.color
                          ? `rgb(${iconDef.color[0]},${iconDef.color[1]},${iconDef.color[2]})`
                          : undefined;

                        return (
                          <div
                            key={`folder-${folder.id}`}
                            className={`flex flex-col transition-opacity ${isEmpty ? "opacity-50" : "opacity-100"}`}
                          >
                            <div className="flex items-center gap-2 py-2 px-2 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-lg group transition-colors">
                              {/* Expand/Collapse Toggle */}
                              <button
                                className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedFolders((prev) => ({
                                    ...prev,
                                    [folder.id]: !isExpanded,
                                  }));
                                }}
                                disabled={
                                  isEmpty &&
                                  files.length === 0 &&
                                  treeData.folders.filter(
                                    (f) => f.parent_id === folder.id,
                                  ).length === 0
                                }
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>

                              {/* Folder Checkbox */}
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                checked={selected}
                                disabled={isEmpty}
                                ref={(input) => {
                                  if (input)
                                    input.indeterminate = indeterminate;
                                }}
                                onChange={(e) =>
                                  handleFolderToggle(
                                    folder.id,
                                    e.target.checked,
                                  )
                                }
                              />

                              <div
                                className="flex items-center gap-2 cursor-pointer flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedFolders((prev) => ({
                                    ...prev,
                                    [folder.id]: !isExpanded,
                                  }));
                                }}
                              >
                                {iconDef?.imageUrl ? (
                                  <img
                                    src={iconDef.imageUrl}
                                    alt=""
                                    className="w-4 h-4 object-contain flex-shrink-0"
                                  />
                                ) : iconDef?.path ? (
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="w-4 h-4 flex-shrink-0"
                                    fill={iconColor || "currentColor"}
                                  >
                                    <path d={iconDef.path} />
                                  </svg>
                                ) : (
                                  <Folder
                                    className={`w-4 h-4 flex-shrink-0 ${selected || indeterminate ? "text-blue-600 fill-blue-600/20 dark:text-blue-400 dark:fill-blue-400/20" : "text-gray-400 fill-gray-400/10"}`}
                                  />
                                )}
                                <span
                                  className={`text-sm font-semibold select-none transition-colors truncate flex items-center gap-1.5 ${selected || indeterminate ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"}`}
                                >
                                  {folder.name}
                                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 rounded-md">
                                    {totalFiles}
                                  </span>
                                </span>
                              </div>
                            </div>
                            {isExpanded && renderTree(folder.id, level + 1)}
                          </div>
                        );
                      })}

                      {files.map((file) => {
                        const isSelected = selectedFiles.includes(file.id);

                        // Optionally show icon for file if it corresponds to an infrastructure type
                        const fileIconKey = getFolderIconKey({
                          name: file.name,
                        });
                        const fileIconDef = fileIconKey
                          ? ICON_DEFS[fileIconKey.toUpperCase()]
                          : null;
                        const fileIconColor = fileIconDef?.color
                          ? `rgb(${fileIconDef.color[0]},${fileIconDef.color[1]},${fileIconDef.color[2]})`
                          : undefined;

                        return (
                          <div
                            key={`file-${file.id}`}
                            className="flex items-center gap-3 py-2 px-2 ml-7 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-lg group transition-colors"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer transition-all"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked)
                                  setSelectedFiles((prev) => [
                                    ...prev,
                                    file.id,
                                  ]);
                                else
                                  setSelectedFiles((prev) =>
                                    prev.filter((id) => id !== file.id),
                                  );
                              }}
                            />
                            {fileIconDef?.imageUrl ? (
                              <img
                                src={fileIconDef.imageUrl}
                                alt=""
                                className="w-4 h-4 object-contain flex-shrink-0 opacity-80"
                              />
                            ) : fileIconDef?.path ? (
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4 flex-shrink-0 opacity-80"
                                fill={fileIconColor || "currentColor"}
                              >
                                <path d={fileIconDef.path} />
                              </svg>
                            ) : (
                              <FileIcon
                                className={`w-4 h-4 ${isSelected ? "text-indigo-500" : "text-gray-400"}`}
                              />
                            )}
                            <span
                              className={`text-sm truncate select-none cursor-pointer flex-1 transition-colors ${isSelected ? "font-medium text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"}`}
                              onClick={() => {
                                if (!isSelected)
                                  setSelectedFiles((prev) => [
                                    ...prev,
                                    file.id,
                                  ]);
                                else
                                  setSelectedFiles((prev) =>
                                    prev.filter((id) => id !== file.id),
                                  );
                              }}
                            >
                              {file.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                };

                return renderTree(null, 0);
              })()}

              {treeData.folders.length === 0 && treeData.files.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10 space-y-3 m-auto">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium animate-pulse">
                    Loading workspace tree...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Export Settings (Fixed above footer) */}
          <div className="px-6 lg:px-8 py-4 bg-gray-100/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50 flex flex-col gap-4 flex-shrink-0">
            {/* Export Mode */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block">
                  Export Mode
                </span>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {exportMode === "merged"
                    ? "Combines everything into a single map layer."
                    : "Packages files individually into a ZIP archive."}
                </p>
              </div>
              <div className="flex bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <button
                  onClick={() => setExportMode("merged")}
                  className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${exportMode === "merged" ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  Merged Map
                </button>
                <button
                  onClick={() => setExportMode("individual")}
                  className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${exportMode === "individual" ? "bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  Individual Files (ZIP)
                </button>
              </div>
            </div>

            {/* Output Format (Only visible if Merged) */}
            {exportMode === "merged" && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
                <div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block">
                    Output Format
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    {outputType === "kml"
                      ? "Standard XML-based format."
                      : "Compressed archive format."}
                  </p>
                </div>
                <div className="flex bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <button
                    onClick={() => setOutputType("kml")}
                    className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${outputType === "kml" ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  >
                    <FileText
                      className={`w-4 h-4 ${outputType === "kml" ? "text-blue-500" : ""}`}
                    />
                    KML
                  </button>
                  <button
                    onClick={() => setOutputType("kmz")}
                    className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${outputType === "kmz" ? "bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)]" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  >
                    <Database
                      className={`w-4 h-4 ${outputType === "kmz" ? "text-indigo-500" : ""}`}
                    />
                    KMZ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between rounded-b-2xl z-10 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            {selectedFiles.length > 0 ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-gray-900 dark:text-white font-bold">
                  {selectedFiles.length}
                </span>{" "}
                items selected
              </>
            ) : (
              "No items selected"
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isProcessing || selectedFiles.length === 0}
              className="px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transform active:scale-95 transition-all flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
