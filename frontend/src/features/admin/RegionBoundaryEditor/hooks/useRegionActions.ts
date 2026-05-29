import { useCallback, useEffect } from "react";
import {
  createOrUpdateDraft,
  analyzeImpact,
  publishDraftBoundary,
  ImpactAnalysis,
} from "../../../../services/region/index";
import { googlePathsToGeoJSON } from "../utils/index";

interface UseRegionActionsProps {
  regionId: number;
  editMode: boolean;
  hasChanges: boolean;
  saving: boolean;
  changeReason: string;
  polygonRefs: React.MutableRefObject<google.maps.Polygon[]>;
  editablePaths: google.maps.LatLng[][][];
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setHasChanges: (hasChanges: boolean) => void;
  setEditMode: (editMode: boolean) => void;
  setEditablePaths: (paths: google.maps.LatLng[][][]) => void;
  setHistory: (history: any[]) => void;
  setHistoryIndex: (index: number) => void;
  setChangeReason: (reason: string) => void;
  setShowSaveDialog: (show: boolean) => void;
  setShowQuickPublishDialog: (show: boolean) => void;
  setImpactAnalysis: (analysis: ImpactAnalysis | null) => void;
  setAnalyzingImpact: (analyzing: boolean) => void;
  onClose?: () => void;
}

export const useRegionActions = ({
  regionId,
  editMode,
  hasChanges,
  saving,
  changeReason,
  polygonRefs,
  editablePaths,
  setSaving,
  setError,
  setSuccess,
  setHasChanges,
  setEditMode,
  setEditablePaths,
  setHistory,
  setHistoryIndex,
  setChangeReason,
  setShowSaveDialog,
  setShowQuickPublishDialog,
  setImpactAnalysis,
  setAnalyzingImpact,
  onClose,
}: UseRegionActionsProps) => {
  // Helper to extract paths
  const getFreshPaths = useCallback(() => {
    return polygonRefs.current.map((polygon) => {
      // Use getPaths() to retrieve all rings (outer path + hole paths)
      const paths = polygon.getPaths();
      const allRings: google.maps.LatLng[][] = [];

      for (let i = 0; i < paths.getLength(); i++) {
        const path = paths.getAt(i);
        const ring: google.maps.LatLng[] = [];
        for (let j = 0; j < path.getLength(); j++) {
          ring.push(path.getAt(j));
        }
        allRings.push(ring);
      }
      return allRings;
    });
  }, [polygonRefs]);

  // Save Draft
  const handleConfirmSave = useCallback(async () => {
    if (!changeReason.trim()) {
      setError("Please provide a reason for this change");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const freshPaths = getFreshPaths();
      const updatedGeoJSON = googlePathsToGeoJSON(
        freshPaths.length > 0 ? freshPaths : editablePaths,
      );

      console.log("🔥 [useRegionActions] Saving Draft:", {
        pathsCount:
          freshPaths.length > 0 ? freshPaths.length : editablePaths.length,
        geoJSONType: updatedGeoJSON.type,
        coordinatesLength: updatedGeoJSON.coordinates?.length || 0,
      });

      await createOrUpdateDraft(
        regionId,
        updatedGeoJSON,
        changeReason,
        "Manual boundary editing via Region Boundary Editor",
        "Manual Edit",
      );

      setSuccess("Draft boundary saved successfully!");
      setShowSaveDialog(false);
      setChangeReason("");
      setEditMode(false);
      setHasChanges(false);
      setEditablePaths([]);
      if (polygonRefs.current) polygonRefs.current = [];
      setHistory([]);
      setHistoryIndex(-1);

      setHistoryIndex(-1);

      // Clear cache to ensure fresh state
      const { boundaryCache } =
        await import("../../../../services/region/boundaryCache");
      await boundaryCache.clear();

      setTimeout(() => {
        if (onClose) onClose();
        else window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error("Failed to save draft:", err);
      setError(err.response?.data?.error || "Failed to save draft boundary");
    } finally {
      setSaving(false);
    }
  }, [
    changeReason,
    regionId,
    getFreshPaths,
    editablePaths,
    setError,
    setSaving,
    setSuccess,
    setShowSaveDialog,
    setChangeReason,
    setEditMode,
    setHasChanges,
    setEditablePaths,
    setHistory,
    setHistoryIndex,
    onClose,
    polygonRefs,
  ]);

  // Save & Publish (Step 1: Draft + Analyze)
  const handleSaveAndPublish = useCallback(async () => {
    if (!hasChanges) {
      setError("No changes to save and publish");
      return;
    }
    if (!changeReason.trim()) {
      setError("Please provide a reason for this change");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const freshPaths = getFreshPaths();
      const updatedGeoJSON = googlePathsToGeoJSON(
        freshPaths.length > 0 ? freshPaths : editablePaths,
      );

      await createOrUpdateDraft(
        regionId,
        updatedGeoJSON,
        changeReason,
        "Manual boundary editing via Region Boundary Editor",
        "Manual Edit",
      );

      setAnalyzingImpact(true);
      const impactData = await analyzeImpact(regionId);
      setImpactAnalysis(impactData.impact);

      setShowSaveDialog(false);
      setShowQuickPublishDialog(true);
    } catch (err: any) {
      console.error("Failed to save/analyze:", err);
      setError(
        err.response?.data?.error || "Failed to save and analyze impact",
      );
    } finally {
      setSaving(false);
      setAnalyzingImpact(false);
    }
  }, [
    hasChanges,
    changeReason,
    regionId,
    getFreshPaths,
    editablePaths,
    setError,
    setSaving,
    setAnalyzingImpact,
    setImpactAnalysis,
    setShowSaveDialog,
    setShowQuickPublishDialog,
  ]);

  // Publish (Step 2: Confirm)
  const handleConfirmPublish = useCallback(async () => {
    // This logic was usually inline in the modal or main component.
    // We can just call publishDraftBoundary(regionId)
    // Let's assume the component calls this directly or we expose a method.
    // But logic for closing dialogs etc involves state.
  }, []);

  return {
    handleConfirmSave,
    handleSaveAndPublish,
    getFreshPaths,
  };
};

