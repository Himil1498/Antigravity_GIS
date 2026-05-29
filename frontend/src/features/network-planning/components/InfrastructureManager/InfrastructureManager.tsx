import React, { useState, useMemo } from "react";
import { useNetworkPageLogic } from "../../hooks/useNetworkPageLogic";
import { useInfrastructureMapData } from "../../hooks/useInfrastructureMapData";

import Breadcrumbs from "../Shared/Breadcrumbs";
import { InfrastructureHeader } from "./InfrastructureHeader";
import { InfrastructureFolderGrid } from "./InfrastructureFolderGrid";
import { InfrastructureFileGrid } from "./InfrastructureFileGrid";
import { InfrastructureModals } from "./InfrastructureModals";
import { RenameFolderModal } from "./RenameFolderModal";
import { useAppSelector } from "../../../../store/index";

import { ExportToolModal } from "./ExportToolModal";

const InfrastructureManager: React.FC = () => {

  const [isExportToolOpen, setIsExportToolOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    folders,
    files,
    breadcrumbs,
    loading,
    navigateTo,
    currentFolder,

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

    handleCreateFolder,
    handleDeleteRequest,
    handleConfirmDelete,
    handleImport,
    handleModalUpload,
    closeImportModal,
    detailsModalOpen,
    setDetailsModalOpen,
    selectedFile,
    handleViewDetails,
    handleViewOnMap,
    handleOpenGlobalMap,
    activeMapFileId,
    activeFeature,
    handleViewFeature,

    handleDeleteFileRequest,
    handleConfirmDeleteFile,
    deleteFileModalOpen,
    setDeleteFileModalOpen,
    fileToDelete,
    isFileDeleting,

    // Feature Edit/Delete
    featureToEdit,
    featureToDelete,
    handleEditFeature,
    handleDeleteFeature,
    setFeatureToEdit,
    setFeatureToDelete,
    handleEditFeatureSuccess,
    handleDeleteFeatureSuccess,

    // Rename
    renameModalOpen,
    setRenameModalOpen,
    folderToRename,
    isRenaming,
    handleRenameRequest,
    handleConfirmRename,
  } = useNetworkPageLogic();

  const { user } = useAppSelector((state) => state.auth);

  // Follow standard ProtectedRoute RBAC logic: Allow admin/superadmin, wildcards, or specific permission
  const hasPermission = (code: string) => !!(
    user?.role === "superadmin" ||
    user?.role === "admin" ||
    user?.permissions?.includes("all" as any) ||
    user?.directPermissions?.includes("all") ||
    user?.permissions?.includes("*" as any) ||
    user?.directPermissions?.includes("*") ||
    user?.permissions?.includes(code as any) || 
    user?.directPermissions?.includes(code)
  );

  const canRename = hasPermission("network:folder:rename");
  const canDelete = hasPermission("network:folder:delete");

  const { singleFile, globalStats, allFiles, currentMapFile } =
    useInfrastructureMapData({
      activeMapFileId,
      files,
      importFolderFiles,
      isMapView,
    });

  // Filter Logic - Case Insensitive
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    return folders.filter(folder => 
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [folders, searchQuery]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    return files.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <InfrastructureHeader
              breadcrumbs={breadcrumbs}
              onOpenGlobalMap={handleOpenGlobalMap}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onImport={handleImport}
              onOpenExportTool={() => setIsExportToolOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Breadcrumb Navigation */}
            <div className="mb-4">
              <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={navigateTo} />
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="space-y-6">
                {/* Skeleton header */}
                <div className="flex items-center gap-3">
                  <div className="w-1 h-7 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  <div className="h-5 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
                {/* Skeleton cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-[180px] bg-white/80 dark:bg-gray-800/60 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 overflow-hidden"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="p-5 space-y-4 animate-pulse">
                        <div className="flex items-start justify-between">
                          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                          <div className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                        </div>
                        <div className="h-5 w-3/4 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                        <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <InfrastructureFolderGrid
                  folders={filteredFolders}
                  parentName={
                    breadcrumbs.length > 0
                      ? breadcrumbs[breadcrumbs.length - 1].name
                      : undefined
                  }
                  onNavigate={(id, name) => navigateTo(id, name)}
                  onImport={handleImport}
                  onDeleteRequest={canDelete ? handleDeleteRequest : undefined}
                  onCreateOpen={() => setIsCreateModalOpen(true)}
                  onRename={handleRenameRequest}
                  canRename={canRename}
                />

                <InfrastructureFileGrid
                  files={filteredFiles}
                  onViewDetails={handleViewDetails}
                />
              </div>
            )}

      <InfrastructureModals
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        handleCreateFolder={handleCreateFolder}
        isCreating={isCreating}
        currentFolder={currentFolder}
        deleteModalOpen={deleteModalOpen}
        folderToDelete={folderToDelete}
        setDeleteModalOpen={setDeleteModalOpen}
        handleConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
        deleteFileModalOpen={deleteFileModalOpen}
        fileToDelete={fileToDelete}
        setDeleteFileModalOpen={setDeleteFileModalOpen}
        handleConfirmDeleteFile={handleConfirmDeleteFile}
        isFileDeleting={isFileDeleting}
        importModalOpen={importModalOpen}
        selectedImportFolder={selectedImportFolder}
        importFolderFiles={importFolderFiles}
        closeImportModal={closeImportModal}
        handleModalUpload={handleModalUpload}
        handleDeleteFileRequest={handleDeleteFileRequest}
        handleViewOnMap={handleViewOnMap}
        detailsModalOpen={detailsModalOpen}
        selectedFile={selectedFile}
        setDetailsModalOpen={setDetailsModalOpen}
        onViewFeature={handleViewFeature} // Pass Handler
        // Feature Edit/Delete Props
        featureToEdit={featureToEdit}
        featureToDelete={featureToDelete}
        setFeatureToEdit={setFeatureToEdit}
        setFeatureToDelete={setFeatureToDelete}
        onEditFeatureSuccess={handleEditFeatureSuccess}
        onDeleteFeatureSuccess={handleDeleteFeatureSuccess}
      />

      {/* Rename Folder Modal */}
      <RenameFolderModal
        isOpen={renameModalOpen}
        folder={folderToRename}
        isRenaming={isRenaming}
        onClose={() => setRenameModalOpen(false)}
        onConfirm={handleConfirmRename}
      />

      {/* Export Tool Modal */}
      <ExportToolModal
        isOpen={isExportToolOpen}
        currentFolderId={
          breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null
        }
        onClose={() => setIsExportToolOpen(false)}
      />
    </div>
  );
};

export default InfrastructureManager;

