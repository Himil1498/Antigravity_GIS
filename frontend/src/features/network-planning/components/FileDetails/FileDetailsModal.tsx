import React, { useState, useEffect } from "react";
import { usePermission } from "../../../../hooks/usePermission";
import {
  FileText,
  MapPin,
  Trash2,
  X,
  TowerControl,
  Zap,
  Radio,
  Activity,
  Calendar,
  Layers,
  FileCheck,
  Table,
} from "lucide-react";
import { ICON_DEFS } from "../NetworkMap/MapIcons";
import { networkPlanningService } from "../../services/api";

interface FileDetailsModalProps {
  isOpen: boolean;
  file: any;
  onClose: () => void;
  onViewOnMap: (file: any) => void;
  onDelete: (file: any) => void;
}

const FileDetailsModal: React.FC<FileDetailsModalProps> = ({
  isOpen,
  file,
  onClose,
  onViewOnMap,
  onDelete,
}) => {
  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState<any[]>([]);
  const { can } = usePermission();

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      if (!file) return;

      if (!file) return;

      try {
        // A. Fetch Folder Info
        if (file.folder_id) {
          try {
            const folderData = await networkPlanningService.getFolderContents(
              file.folder_id,
            );
            if (isMounted) setFolderBreadcrumbs(folderData.breadcrumbs || []);
          } catch (e) {
            console.warn("Failed to fetch folder info");
          }
        }

      } catch (e) {
        console.error("Failed to fetch details", e);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [file]);

  if (!isOpen || !file) return null;

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-gray-100 dark:border-gray-700">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-gray-50 dark:bg-gray-700 shadow-inner border border-gray-100 dark:border-gray-600 sm:mx-0 sm:h-12 sm:w-12">
                <FileText className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-start">
                  <h3
                    className="text-lg leading-6 font-bold text-gray-900 dark:text-white"
                    id="modal-title"
                  >
                    File Details
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-gray-500 hover:text-white dark:text-gray-400 hover:bg-red-500 rounded-lg transition-all duration-300 group shadow-sm"
                  >
                    <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
                  </button>
                </div>
                <div className="mt-6 space-y-3">
                  {/* Basic Info */}
                  <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-sm">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      File Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold break-all">
                      {file.name}
                    </p>
                  </div>

                  {/* Location Info */}
                  {folderBreadcrumbs.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Location Path
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white font-medium flex items-center gap-2">
                        {folderBreadcrumbs.map((b) => b.name).join(" / ")}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 block">
                        File Type
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white uppercase font-bold">
                        {file.file_type}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 block">
                        File Size
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {(file.size_bytes / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-sm flex flex-col justify-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 block">
                        Map Icon Render
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white dark:bg-gray-900 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                          {(() => {
                            const iconKey = (file.icon_type || "default").toUpperCase();
                            const iconDef = ICON_DEFS[iconKey];

                            if (iconDef) {
                              const [r, g, b] = iconDef.color || [99, 102, 241];
                              return (
                                <svg
                                  viewBox="0 0 24 24"
                                  className="w-4 h-4"
                                  style={{ fill: `rgb(${r},${g},${b})` }}
                                >
                                  <path d={iconDef.path} />
                                </svg>
                              );
                            }
                            return <MapPin className="w-4 h-4 text-gray-400" />;
                          })()}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white font-semibold capitalize">
                          {file.icon_type || "Default Marker"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-sm flex flex-col justify-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Uploaded At
                      </label>
                      <p className="text-xs text-gray-900 dark:text-gray-300 font-medium">
                        {new Date(file.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                      </p>
                    </div>
                  </div>

                  {file.properties?.is_outcome && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1 block">
                          Approved By
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {file.properties.approved_by_name || "Unknown"}
                        </p>
                      </div>
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1 block">
                          Approved Date
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {file.properties.approved_at
                            ? new Date(file.properties.approved_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  )}

                  {file.processing_status && (
                    <div
                      className={`p-4 rounded-xl border shadow-sm ${
                        file.processing_status === "completed"
                          ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30"
                          : file.processing_status === "failed"
                            ? "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30"
                            : "bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30"
                      }`}
                    >
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 block">
                        Processing Status
                      </label>
                      <p
                        className={`text-sm font-bold capitalize flex items-center gap-2 ${
                          file.processing_status === "completed"
                            ? "text-green-700 dark:text-green-400"
                          : file.processing_status === "failed"
                            ? "text-red-700 dark:text-red-400"
                          : "text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {file.processing_status === "completed" && (
                          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                        )}
                        {file.processing_status === "failed" && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                        )}
                        {file.processing_status === "pending" && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        )}
                        {file.processing_status}
                      </p>
                      {file.error_message && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2 pl-3 border-l-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 py-1 pr-2 rounded-r">
                          {file.error_message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse gap-3 border-t border-gray-100 dark:border-gray-700/50">
            <button
              type="button"
              disabled={
                file.processing_status && file.processing_status !== "completed"
              }
              className={`w-full inline-flex justify-center items-center gap-2 rounded-xl border border-transparent shadow-md px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto transition-all ${
                file.processing_status && file.processing_status !== "completed"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-95"
              }`}
              onClick={() => onViewOnMap(file)}
            >
              <MapPin className="w-4 h-4" />
              View on Map
            </button>

            {(() => {
              const statusStr = (file.properties?.status || file.metadata?.status || "").toLowerCase();
              const isPlanned = statusStr === "planned";
              const isActive = statusStr === "active";
              const isImported = file.metadata?.source === "import" || file.properties?.source === "import";
              
              const canEditPlanned = can("network:file:edit_form_planned");
              const canEditLive = can("network:file:edit_form_live");
              const canEditImported = can("network:file:edit_form_imported");
              
              const canLiveEditPlanned = can("network:file:edit_inline_planned");
              const canLiveEditLive = can("network:file:edit_inline_live");
              const canLiveEditImported = can("network:file:edit_inline_imported");

              const canDeletePlannedFeature = can("network:file:delete_feature_planned");
              const canDeleteLiveFeature = can("network:file:delete_feature_live");
              const canDeleteImportedFeature = can("network:file:delete_feature_imported");

              const hasRelevantPerms = (isPlanned && (canEditPlanned || canDeletePlannedFeature || canLiveEditPlanned)) ||
                                       (isActive && (canEditLive || canDeleteLiveFeature || canLiveEditLive)) ||
                                       (isImported && (canEditImported || canDeleteImportedFeature || canLiveEditImported)) ||
                                       (!isPlanned && !isActive && !isImported && (canEditLive || canDeleteLiveFeature || canLiveEditLive));

              if (!hasRelevantPerms && !can("network:manage_features")) return null;

              return (
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2.5 bg-white dark:bg-gray-700 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto transition-all active:scale-95"
                  onClick={() => {
                    const event = new CustomEvent("openFileDataViewer", {
                      detail: file,
                    });
                    window.dispatchEvent(event);
                    onClose();
                  }}
                >
                  <Table className="w-4 h-4" />
                  View Data
                </button>
              );
            })()}

            {(() => {
              // Determine which permission is needed based on file type and status
              const statusStr = (file.properties?.status || file.metadata?.status || "").toLowerCase();
              const isPlanned = statusStr === "planned";
              const isActive = statusStr === "active";
              const isImported = file.metadata?.source === "import" || file.properties?.source === "import";
              
              let hasPermission = false;
              if (isPlanned) {
                hasPermission = can("network:file:delete_file_planned");
              } else if (isActive) {
                hasPermission = can("network:file:delete_file_live");
              } else if (isImported) {
                hasPermission = can("network:file:delete_file_imported");
              } else {
                // Default to Live Inventory Data for everything else
                hasPermission = can("network:file:delete_file_live");
              }

              if (!hasPermission) return null;

              return (
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2.5 bg-white dark:bg-gray-700 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto transition-all active:scale-95"
                  onClick={() => onDelete(file)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              );
            })()}
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2.5 bg-white dark:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto transition-all active:scale-95"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDetailsModal;

