import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useNetworkContents } from "./useNetworkContents";
import { networkPlanningService } from "../services/api";
import { showToast } from "../../../utils/toastUtils";
import { useAppDispatch } from "../../../store";
import { addVisibleFileId } from "../../../store/slices/mapSlice";
export const useNetworkPageLogic = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    currentFolderId,
    folders,
    files,
    breadcrumbs,
    loading,
    navigateTo,
    createFolder,
    deleteFolder,
    uploadFiles,
    deleteFile,
    refresh,
    silentRefresh,
  } = useNetworkContents();

  // UI State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedImportFolder, setSelectedImportFolder] = useState<any>(null);
  const [importFolderFiles, setImportFolderFiles] = useState<any[]>([]);

  // Rename Modal State
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<any>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  // Handlers
  const handleCreateFolder = async (name: string, defaultIcon?: string) => {
    setIsCreating(true);
    try {
      await createFolder(name, defaultIcon);
      setIsCreateModalOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRequest = (folder: any) => {
    setFolderToDelete(folder);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!folderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFolder(folderToDelete);
      setDeleteModalOpen(false);
      setFolderToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameRequest = (folder: any) => {
    setFolderToRename(folder);
    setRenameModalOpen(true);
  };

  const handleConfirmRename = async (newName: string) => {
    if (!folderToRename) return;
    setIsRenaming(true);
    try {
      await networkPlanningService.renameFolder(folderToRename.id, newName);
      showToast.success(`Folder renamed to "${newName}"`);
      setRenameModalOpen(false);
      setFolderToRename(null);
      refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Failed to rename folder";
      showToast.error(msg);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleImport = async (folder: any) => {
    // Allow imports into all folders, including root-level folders like "TESTING"

    setSelectedImportFolder(folder);
    setImportModalOpen(true);
    setImportFolderFiles([]); // Clear previous

    try {
      const contents = await networkPlanningService.getFolderContents(
        folder.id,
      );
      setImportFolderFiles(contents.files || []);
    } catch (e) {
      console.error(e);
      showToast.error("Failed to load existing files");
    }
  };

  const handleModalUpload = async (files: File[], iconType: string) => {
    if (!selectedImportFolder) return;
    try {
      await uploadFiles(selectedImportFolder.id, files, iconType);

      // Fire-and-forget refresh to prevent blocking the UI spinner if fetch delays
      networkPlanningService
        .getFolderContents(selectedImportFolder.id)
        .then((contents) => setImportFolderFiles(contents.files || []))
        .catch((e) => console.warn("Background refresh failed", e));
    } catch (e) {
      // Error handling already in uploadFiles
      throw e; // Re-throw to ensure useFileImport catches it
    }
  };

  // Delete File Modal State
  const [deleteFileModalOpen, setDeleteFileModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<any>(null);
  const [isFileDeleting, setIsFileDeleting] = useState(false);

  const handleDeleteFileRequest = (file: any) => {
    setFileToDelete(file);
    setDeleteFileModalOpen(true);
  };

  const handleConfirmDeleteFile = async () => {
    if (!fileToDelete) return;

    setIsFileDeleting(true);

    try {
      // ✅ Wait for delete to complete
      await deleteFile(fileToDelete.id);

      // ✅ Store fileToDelete info BEFORE clearing it
      const deletedFileId = fileToDelete.id;

      // ✅ Close modal FIRST
      setDeleteFileModalOpen(false);

      // ✅ Clean up URL params
      const currentFileId = searchParams.get("fileId");
      if (currentFileId && String(currentFileId) === String(deletedFileId)) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("fileId");
        setSearchParams(newParams);
      }

      // ✅ Close details modal if showing deleted file
      if (
        detailsModalOpen &&
        String(selectedFile?.id) === String(deletedFileId)
      ) {
        setDetailsModalOpen(false);
        setSelectedFile(null);
      }

      // ✅ Refresh import list if needed
      if (importModalOpen && selectedImportFolder) {
        try {
          const contents = await networkPlanningService.getFolderContents(
            selectedImportFolder.id,
          );
          setImportFolderFiles(contents.files || []);
        } catch (refreshErr) {
          console.warn("Failed to refresh import list:", refreshErr);
        }
      }
    } catch (err: any) {
      console.error("Delete failed:", err);
      // ❌ Don't close modal on error
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete file. Please try again.";
      showToast.error(errorMsg);
    } finally {
      // ✅ Always cleanup loading state and fileToDelete
      setIsFileDeleting(false);
      setFileToDelete(null);
    }
  };

  const closeImportModal = () => {
    setImportModalOpen(false);
    setSelectedImportFolder(null);
    if (currentFolderId == selectedImportFolder?.id) {
      silentRefresh();
    }
  };

  // Polling Logic
  const lastPollTimeRef = useRef(0);
  const isPollingRef = useRef(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (importModalOpen && selectedImportFolder) {
      // Dynamic Polling with Overlap Protection
      intervalId = setInterval(async () => {
        const now = Date.now();
        // Prevent overlap OR too frequent polling (debounce) OR if DELETING
        if (
          isPollingRef.current ||
          isFileDeleting ||
          now - lastPollTimeRef.current < 4500
        )
          return;

        isPollingRef.current = true;
        lastPollTimeRef.current = now;

        try {
          const contents = await networkPlanningService.getFolderContents(
            selectedImportFolder.id,
          );
          setImportFolderFiles(contents.files || []);

          // Also refresh main list if we are in that folder (SILENTLY)
          // Use loose equality to handle string/number mismatches from URL/API
          if (currentFolderId == selectedImportFolder.id) {
            silentRefresh();
          }
        } catch (e) {
          console.error("Polling error", e);
        } finally {
          isPollingRef.current = false;
        }
      }, 5000); // Base 5s interval
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    importModalOpen,
    selectedImportFolder,
    currentFolderId,
    silentRefresh,
    isFileDeleting,
  ]);

  // URL State Management
  const [searchParams, setSearchParams] = useSearchParams();

  // Map View State (derived from URL)
  const isMapView = searchParams.get("view") === "map";
  const activeMapFileId = searchParams.get("fileId")
    ? parseInt(searchParams.get("fileId")!)
    : undefined;

  // Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleViewDetails = (file: any) => {
    setSelectedFile(file);
    setDetailsModalOpen(true);
  };

  // Handlers
  const setIsMapView = (showMap: boolean) => {
    if (showMap) {
      navigate("/map?network-catalog=open");
    }
  };

  const handleViewOnMap = async (file: any) => {
    setDetailsModalOpen(false);
    setImportModalOpen(false);

    if (file && file.id) {
      dispatch(addVisibleFileId(file.id));
    }

    navigate("/map?network-catalog=open");
  };

  const handleOpenGlobalMap = () => {
    navigate("/map?network-catalog=open");
  };

  // Feature Zoom State (Transient)
  const [activeFeature, setActiveFeature] = useState<any>(null);

  const handleViewFeature = (feature: any) => {
    navigate("/map?network-catalog=open");
  };

  // Feature Edit/Delete State
  const [featureToEdit, setFeatureToEdit] = useState<any>(null);
  const [featureToDelete, setFeatureToDelete] = useState<any>(null);

  const handleEditFeature = (feature: any) => {
    setFeatureToEdit(feature);
  };

  const handleDeleteFeature = (feature: any) => {
    setFeatureToDelete(feature);
  };

  const handleEditFeatureSuccess = () => {
    setFeatureToEdit(null);
    refresh(); // Refresh content to update map/list
  };

  const handleDeleteFeatureSuccess = () => {
    setFeatureToDelete(null);
    refresh(); // Refresh content to update map/list
  };

  return {
    // Data from useNetworkContents
    currentFolderId,
    currentFolder: breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null,
    folders,
    files,
    breadcrumbs,
    loading,
    navigateTo,

    // Local UI State
    isCreateModalOpen,
    setIsCreateModalOpen,
    isCreating,
    deleteModalOpen,
    setDeleteModalOpen,
    folderToDelete,
    isDeleting,
    importModalOpen,
    selectedImportFolder,
    importFolderFiles,
    isMapView,
    setIsMapView,
    detailsModalOpen,
    setDetailsModalOpen,
    selectedFile,

    // Handlers
    handleCreateFolder,
    handleDeleteRequest,
    handleConfirmDelete,
    handleImport,
    handleModalUpload,
    handleDeleteFileRequest,
    handleConfirmDeleteFile,
    deleteFileModalOpen,
    setDeleteFileModalOpen,
    fileToDelete,
    isFileDeleting,
    closeImportModal,
    handleViewDetails,
    handleViewOnMap,
    handleOpenGlobalMap,
    activeMapFileId,
    activeFeature, // New Return
    handleViewFeature, // New Returns
    deleteFile,

    // Rename
    renameModalOpen,
    setRenameModalOpen,
    folderToRename,
    isRenaming,
    handleRenameRequest,
    handleConfirmRename,

    // Feature Edit/Delete
    featureToEdit,
    featureToDelete,
    handleEditFeature,
    handleDeleteFeature,
    setFeatureToEdit, // Exposed to close modal
    setFeatureToDelete, // Exposed to close modal
    handleEditFeatureSuccess,
    handleDeleteFeatureSuccess,
  };
};

