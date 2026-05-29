import React, { useState } from "react";
import RegionBoundaryEditor from "../RegionBoundaryEditor";
import RegionFilters from "../RegionManagement/components/RegionFilters";
import RegionList from "../RegionManagement/components/RegionList";
import RegionInfoPanel from "../RegionManagement/components/RegionInfoPanel";
import RegionDetails from "./components/RegionDetails";

import { useRegionManagement } from "../../../hooks/useRegionManagement";
import { useBoundaryData } from "./hooks/useBoundaryData";
import { useBoundaryActions } from "./hooks/useBoundaryActions";
import { useRef } from "react";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { ImpactAnalysisDialog } from "../../../features/admin/RegionBoundaryEditor/components/ImpactAnalysisDialog";
import { showToast } from "../../../utils/toastUtils";

import { usePermission } from "../../../hooks/usePermission";
import AccessDenied from "../../admin/AuditLogViewer/components/AccessDenied";

type ViewState = "list" | "details" | "editor";

const BoundaryManagement: React.FC = () => {
  const { can, isAdmin } = usePermission();
  const canAccess = isAdmin || can("admin:region_boundaries");

  const [view, setView] = useState<ViewState>("list");

  const {
    regions,
    loading: regionsLoading,
    error: regionsError,
    selectedRegion: selectedRegionId,
    setSelectedRegion: onSelectRegionId,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    fetchRegions,
    filteredRegions,
    regionTypes,
    clearFilters,
  } = useRegionManagement();



  // Derived selected region object
  const selectedRegion = regions.find((r) => r.id === selectedRegionId) || null;

  // Boundary Data & Actions Hooks
  const {
    draftExists,
    currentBoundary,
    versions,
    totalVersions,
    publishedVersionsCount,
    infrastructureStats,
    refreshAll,
  } = useBoundaryData(selectedRegion);

  const {
    publishDraft,
    discard,
    unpublish,
    deleteAll,
    analyze,
    impactAnalysisData,
    setImpactAnalysisData,
  } = useBoundaryActions({
    selectedRegion,
    onSuccess: (msg) => showToast.success(msg),
    onError: (msg) => showToast.error(msg),
    onRefresh: refreshAll,
  });

  // Local state for confirmation dialogs
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImpactDialog, setShowImpactDialog] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);



  const handleSelectRegion = (id: number) => {
    onSelectRegionId(id);
    setView("details");
  };

  const handleBackToList = () => {
    onSelectRegionId(null);
    setView("list");
  };

  const handleOpenEditor = () => {
    setView("editor");
  };

  const handleCloseEditor = () => {
    // When closing editor, go back to details and refresh data
    setView("details");
    refreshAll();
  };

  if (!canAccess) {
    return <AccessDenied />;
  }

  if (regionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading regions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions - Only show in List view or Details view */}
      {view !== "editor" && (
        <div className="flex items-center justify-between pb-4 border-b border-gray-100/50">
          <div className="flex flex-col items-start gap-3">
            {view === "details" && (
              <button
                onClick={handleBackToList}
                className="px-3 py-1.5 text-blue-700 font-bold flex items-center gap-1.5 text-sm bg-blue-50/80 hover:bg-blue-100 rounded-lg transition-all border border-blue-200/50 hover:-translate-x-1 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Region List
              </button>
            )}
            <div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-600 bg-clip-text text-transparent tracking-tight">
                {view === "details" && selectedRegion
                  ? `${selectedRegion.name} Boundary`
                  : "Region Boundaries"}
              </h2>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {view === "details"
                  ? "Manage version history and publication"
                  : "Manage and edit validation boundaries for all regions"}
              </p>
            </div>
          </div>

        </div>
      )}

      {regionsError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {regionsError}
        </div>
      )}

      {/* VIEW: LIST */}
      {view === "list" && (
        <div className="space-y-6">
          <RegionFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            regionTypes={regionTypes}
            totalRegions={regions.length}
            filteredCount={filteredRegions.length}
            onClear={clearFilters}
          />

          <RegionList
            regions={filteredRegions}
            onSelectRegion={handleSelectRegion}
          />

          <RegionInfoPanel />
        </div>
      )}

      {/* VIEW: DETAILS */}
      {view === "details" && selectedRegion && (
        <RegionDetails
          selectedRegion={selectedRegion}
          draftExists={draftExists}
          currentBoundary={currentBoundary}
          versions={versions}
          totalVersions={totalVersions}
          publishedVersionsCount={publishedVersionsCount}
          infrastructureStats={infrastructureStats}
          onAnalyze={async () => {
            setAnalyzing(true);
            await analyze();
            setAnalyzing(false);
          }}
          onShowImpactPreview={() => setShowImpactDialog(true)}
          onShowPublishConfirm={() => setShowPublishConfirm(true)}
          onShowDiscardConfirm={() => setShowDiscardConfirm(true)}
          onShowUnpublishConfirm={() => setShowUnpublishConfirm(true)}
          onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
          onOpenEditor={handleOpenEditor}
        />
      )}

      {/* VIEW: EDITOR */}
      {view === "editor" && selectedRegion && (
        <div>
          <button
            onClick={handleCloseEditor}
            className="mb-4 px-3 py-1.5 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 text-sm bg-blue-50 rounded"
          >
            ← Back to Details
          </button>
          <RegionBoundaryEditor
            regionId={selectedRegion.id}
            onClose={handleCloseEditor}
          />
        </div>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={showPublishConfirm}
        title="Publish Boundary Changes"
        message="Are you sure you want to publish these changes? This will update the active boundary for this region."
        confirmText="Publish"
        cancelText="Cancel"
        onConfirm={async () => {
          await publishDraft("Published from Management Dashboard");
          setShowPublishConfirm(false);
        }}
        onClose={() => setShowPublishConfirm(false)}
        type="success"
      />

      <ConfirmDialog
        isOpen={showDiscardConfirm}
        title="Discard Draft"
        message="Are you sure you want to discard your unpublished changes? This action cannot be undone."
        confirmText="Discard"
        cancelText="Cancel"
        onConfirm={async () => {
          await discard();
          setShowDiscardConfirm(false);
        }}
        onClose={() => setShowDiscardConfirm(false)}
        type="danger"
      />

      <ConfirmDialog
        isOpen={showUnpublishConfirm}
        title="Unpublish Boundary"
        message={`This will remove the published boundary for "${selectedRegion?.name || 'this region'}" from the map. A draft copy will be saved automatically so you can continue editing from where you left off. All version history is preserved.`}
        confirmText="Unpublish"
        cancelText="Cancel"
        onConfirm={async () => {
          await unpublish("Unpublished by Admin");
          setShowUnpublishConfirm(false);
        }}
        onClose={() => setShowUnpublishConfirm(false)}
        type="warning"
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={`⚠️ Permanently Delete All Data — ${selectedRegion?.name || 'Region'}`}
        message="This will PERMANENTLY DELETE all boundary versions, drafts, and history for this region. This action is IRREVERSIBLE — no data can be recovered. Only use this if you want to completely start fresh."
        confirmText="Yes, Delete Everything"
        cancelText="No, Keep Data"
        onConfirm={async () => {
          await deleteAll("Full reset by Admin");
          setShowDeleteConfirm(false);
        }}
        onClose={() => setShowDeleteConfirm(false)}
        type="danger"
      />

      {impactAnalysisData && (
        <ImpactAnalysisDialog
          isOpen={showImpactDialog}
          onClose={() => setShowImpactDialog(false)}
          data={impactAnalysisData}
          isLoading={analyzing}
        />
      )}

      {/* Import Preview Dialog */}

    </div>
  );
};

export default BoundaryManagement;
