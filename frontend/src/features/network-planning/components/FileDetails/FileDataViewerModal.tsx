import React, { useState, useEffect } from "react";
import { X, Table } from "lucide-react";
import { FeatureDataGrid } from "./FeatureDataGrid";
import { ICON_DEFS } from "../NetworkMap/MapIcons";
import EditInfrastructureModal from "../InfrastructureManager/EditInfrastructureModal";
import DeleteFeatureModal from "../Modals/DeleteFeatureModal";
import { useAppSelector } from "../../../../store";
import { rolesMatch } from "../../../../utils/rbac/helpers";
import { showToast } from "../../../../utils/toastUtils";
import { usePermission } from "../../../../hooks/usePermission";

interface FileDataViewerModalProps {
  isOpen: boolean;
  file: any;
  onClose: () => void;
}

export const FileDataViewerModal: React.FC<FileDataViewerModalProps> = ({
  isOpen,
  file,
  onClose,
}) => {
  const { user } = useAppSelector((state) => state.auth);

  // DEBUG LOG
  useEffect(() => {
    if (isOpen && file) {
      console.log("🔍 [FileDataViewerModal] File Object:", file);
      console.log("🔍 [FileDataViewerModal] is_outcome check:", {
        direct: file.is_outcome,
        props: file.properties?.is_outcome,
        metadata: file.metadata?.is_outcome,
        shouldDisable: !!(
          file.is_outcome ||
          file.properties?.is_outcome ||
          file.metadata?.is_outcome
        ),
      });
    }
  }, [isOpen, file]);

  const [editFeature, setEditFeature] = useState<any | null>(null);
  const [deleteFeature, setDeleteFeature] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [localFeatureCount, setLocalFeatureCount] = useState<number | null>(file?.feature_count ?? null);

  useEffect(() => {
    setLocalFeatureCount(file?.feature_count ?? null);
  }, [file]);

  // Permission Logic
  const { can } = usePermission();

  // Allow "Technician" owner override? Or stricly use permission?
  // Current requirement implies permission-based.
  // We can keep the owner check if "Technician" doesn't have the permission explicitly but is allowed to edit their own.
  // But typically consistent RBAC is better. Let's use `can` + owner check if needed.
  // The prompt implies we want the permission to work.
  // Let's use the explicit permission as the primary gate.

  // Determine which permission is needed based on file type and status
  const statusStr = (file?.properties?.status || file?.metadata?.status || "").toLowerCase();
  const isPlanned = statusStr === "planned";
  const isActive = statusStr === "active";
  const isImported = file?.metadata?.source === "import" || file?.properties?.source === "import";
  
  let canEditForm = false;
  let canLiveEdit = false;
  if (isPlanned) {
    canEditForm = can("network:file:edit_planned");
    canLiveEdit = can("network:file:live_edit_planned");
  } else if (isActive) {
    canEditForm = can("network:file:edit_live");
    canLiveEdit = can("network:file:live_edit_live");
  } else if (isImported) {
    canEditForm = can("network:file:edit_imported");
    canLiveEdit = can("network:file:live_edit_imported");
  } else {
    canEditForm = can("network:file:edit_live"); // default
    canLiveEdit = can("network:file:live_edit_live");
  }

  let canDeleteFeature = false;
  if (isPlanned) {
    canDeleteFeature = can("network:file:delete_feature_planned");
  } else if (isActive) {
    canDeleteFeature = can("network:file:delete_feature_live");
  } else if (isImported) {
    canDeleteFeature = can("network:file:delete_feature_imported");
  } else {
    canDeleteFeature = can("network:file:delete_feature_live"); // default
  }

  if (!isOpen || !file) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 overflow-hidden"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >

          {/* Modal Container - FULL SCREEN (adjusted for Navbar) */}
          <div className="fixed top-14 sm:top-16 inset-x-0 bottom-0 bg-gray-50 dark:bg-gray-950 text-left overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* ── Content Area ── */}
            <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950 flex flex-col">
                <FeatureDataGrid
                  key={refreshKey}
                  fileId={file.id}
                  headerLeft={
                    <div className="flex items-center gap-4">
                      {/* Icon Container */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                        {file.icon_type &&
                        (ICON_DEFS[(file.icon_type as string).toUpperCase()] ||
                          ICON_DEFS[file.icon_type]) ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
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
                          <Table className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>

                      {/* Title + Info */}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Data Preview
                          </h3>
                          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-200/50 dark:border-indigo-500/20 font-mono">
                            {file.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {localFeatureCount !== undefined && localFeatureCount !== null 
                            ? <><span className="font-semibold text-gray-700 dark:text-gray-300">{localFeatureCount.toLocaleString()}</span> features loaded</>
                            : "All features loaded"
                          }
                        </p>
                      </div>
                    </div>
                  }
                  headerRight={
                    <button
                      onClick={onClose}
                      className="group flex items-center justify-center w-10 h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-300"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
                    </button>
                  }
                  canEditForm={
                    !!canEditForm &&
                    !file.is_outcome &&
                    !file.properties?.is_outcome &&
                    !file.metadata?.is_outcome
                  }
                  canLiveEdit={
                    !!canLiveEdit &&
                    !file.is_outcome &&
                    !file.properties?.is_outcome &&
                    !file.metadata?.is_outcome
                  }
                  canDelete={
                    !!canDeleteFeature &&
                    !file.is_outcome &&
                    !file.properties?.is_outcome &&
                    !file.metadata?.is_outcome
                  }
                  onEditFeature={(f) => setEditFeature(f)}
                  onDeleteFeature={(f) => setDeleteFeature(f)}
                />
            </div>
          </div>
      </div>
      {editFeature && (
        <EditInfrastructureModal
          isOpen={true}
          featureId={editFeature.id}
          onClose={() => setEditFeature(null)}
          onSuccess={() => {
            setEditFeature(null);
            setRefreshKey((prev) => prev + 1);
          }}
        />
      )}

      {deleteFeature && (
        <DeleteFeatureModal
          isOpen={true}
          featureId={deleteFeature.id}
          featureName={deleteFeature.properties?.name}
          onClose={() => setDeleteFeature(null)}
          onSuccess={() => {
            setDeleteFeature(null);
            setRefreshKey((prev) => prev + 1);
            setLocalFeatureCount((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
            showToast.success("Feature moved to recycle bin successfully"); // Trigger Toast
          }}
        />
      )}
    </>
  );
};

