import React from "react";
import CreateFolderModal from "./CreateFolderModal";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import ImportFileModal from "../ImportFileModal";
import { FileDetailsModal } from "../FileDetails";
import { FileDataViewerModal } from "../FileDetails/FileDataViewerModal";
import { NetworkFolder, NetworkFile } from "../../types";
import EditInfrastructureModal from "./EditInfrastructureModal";
import DeleteFeatureModal from "../Modals/DeleteFeatureModal";
import SubmissionSuccessModal from "../Modals/SubmissionSuccessModal";

interface InfrastructureModalsProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (isOpen: boolean) => void;
  handleCreateFolder: (name: string, defaultIcon?: string) => Promise<void>;
  isCreating: boolean;
  currentFolder?: any;

  deleteModalOpen: boolean;
  folderToDelete: NetworkFolder | null;
  setDeleteModalOpen: (isOpen: boolean) => void;
  handleConfirmDelete: () => Promise<void>;
  isDeleting: boolean;

  deleteFileModalOpen: boolean;
  fileToDelete: NetworkFile | null;
  setDeleteFileModalOpen: (isOpen: boolean) => void;
  handleConfirmDeleteFile: () => Promise<void>;
  isFileDeleting: boolean;

  importModalOpen: boolean;
  selectedImportFolder: NetworkFolder | null;
  importFolderFiles: NetworkFile[];
  closeImportModal: () => void;
  handleModalUpload: (files: File[], iconType: string) => Promise<void>;
  handleDeleteFileRequest: (file: NetworkFile) => void;
  handleViewOnMap: (file: NetworkFile) => void;

  detailsModalOpen: boolean;
  selectedFile: NetworkFile | null;
  setDetailsModalOpen: (isOpen: boolean) => void;
  onViewFeature?: (feature: any) => void;

  // Feature Edit/Delete Props
  featureToEdit?: any;
  featureToDelete?: any;
  setFeatureToEdit?: (feature: any) => void;
  setFeatureToDelete?: (feature: any) => void;
  onEditFeatureSuccess?: () => void;
  onDeleteFeatureSuccess?: () => void;
}

export const InfrastructureModals: React.FC<InfrastructureModalsProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  handleCreateFolder,
  isCreating,
  currentFolder,

  deleteModalOpen,
  folderToDelete,
  setDeleteModalOpen,
  handleConfirmDelete,
  isDeleting,

  deleteFileModalOpen,
  fileToDelete,
  setDeleteFileModalOpen,
  handleConfirmDeleteFile,
  isFileDeleting,

  importModalOpen,
  selectedImportFolder,
  importFolderFiles,
  closeImportModal,
  handleModalUpload,
  handleDeleteFileRequest,
  handleViewOnMap,

  detailsModalOpen,
  selectedFile,
  setDetailsModalOpen,
  onViewFeature, // New Callback

  featureToEdit,
  featureToDelete,
  setFeatureToEdit,
  setFeatureToDelete,
  onEditFeatureSuccess,
  onDeleteFeatureSuccess,
}) => {
  // Local state for Data Viewer (Decoupled via Event)
  const [isDataViewerOpen, setIsDataViewerOpen] = React.useState(false);
  const [dataViewerFile, setDataViewerFile] =
    React.useState<NetworkFile | null>(null);

  // Success Modal State
  const [deleteSuccessOpen, setDeleteSuccessOpen] = React.useState(false);

  React.useEffect(() => {
    const handleOpenDataViewer = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setDataViewerFile(customEvent.detail);
        setIsDataViewerOpen(true);
      }
    };

    const handleViewFeatureOnMap = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && onViewFeature) {
        // Close the data viewer to show the map
        setIsDataViewerOpen(false);
        // Also close details modal if open (optional but good for UX)
        setDetailsModalOpen(false);
        // Trigger View
        onViewFeature(customEvent.detail);
      }
    };

    window.addEventListener("openFileDataViewer", handleOpenDataViewer);
    window.addEventListener("viewFeatureOnMap", handleViewFeatureOnMap);
    return () => {
      window.removeEventListener("openFileDataViewer", handleOpenDataViewer);
      window.removeEventListener("viewFeatureOnMap", handleViewFeatureOnMap);
    };
  }, [onViewFeature, setDetailsModalOpen]);

  return (
    <>
      <CreateFolderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateFolder}
        isLoading={isCreating}
        parentFolder={currentFolder}
      />

      <ImportFileModal
        isOpen={importModalOpen}
        folder={selectedImportFolder}
        files={importFolderFiles}
        onClose={closeImportModal}
        onUpload={handleModalUpload}
        onDelete={handleDeleteFileRequest}
        onViewOnMap={handleViewOnMap}
      />

      <FileDetailsModal
        isOpen={detailsModalOpen}
        file={selectedFile}
        onClose={() => setDetailsModalOpen(false)}
        onViewOnMap={handleViewOnMap}
        onDelete={handleDeleteFileRequest}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        itemName={folderToDelete?.name || ""}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemType="folder"
        isDeleting={isDeleting}
      />

      <DeleteConfirmationModal
        isOpen={deleteFileModalOpen}
        itemName={fileToDelete?.name || ""}
        onClose={() => setDeleteFileModalOpen(false)}
        onConfirm={handleConfirmDeleteFile}
        itemType="file"
        isDeleting={isFileDeleting}
      />

      <FileDataViewerModal
        isOpen={isDataViewerOpen}
        file={dataViewerFile}
        onClose={() => setIsDataViewerOpen(false)}
      />

      {/* Feature Edit/Delete Modals (Triggered from Map or Global Context) */}
      {featureToEdit && (
        <EditInfrastructureModal
          isOpen={!!featureToEdit}
          featureId={featureToEdit.id}
          onClose={() => setFeatureToEdit?.(null)}
          onSuccess={() => onEditFeatureSuccess?.()}
        />
      )}

      {featureToDelete && (
        <DeleteFeatureModal
          isOpen={!!featureToDelete}
          featureId={featureToDelete.id}
          featureName={featureToDelete.properties?.name}
          onClose={() => setFeatureToDelete?.(null)}
          onSuccess={() => {
            onDeleteFeatureSuccess?.();
            // Show success modal locally or via prop if managed centrally
            // But since this is a composition, we can add a local success state here
            setDeleteSuccessOpen(true);
          }}
        />
      )}

      {/* Success Modal for Soft Delete */}
      <SubmissionSuccessModal
        isOpen={deleteSuccessOpen}
        onClose={() => setDeleteSuccessOpen(false)}
        message="Feature deleted and moved to recycle bin successfully"
      />
    </>
  );
};

