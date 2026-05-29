import { useState } from "react";
import { 
  analyzeImpact, 
  discardDraft, 
  revertBoundaryToVersion,
  publishDraftBoundary,
  unpublishBoundary,
  deleteAllBoundaryData,
  Region,
  ImpactAnalysis,
  BoundaryVersion
} from "../../../../services/region/index";
import { boundaryCache } from "../../../../services/region/boundaryCache";

interface UseBoundaryActionsProps {
  selectedRegion: Region | null;
  onSuccess: (message: string) => void;
  onError?: (message: string) => void;
  onRefresh: () => void;
}

export const useBoundaryActions = ({ selectedRegion, onSuccess, onError, onRefresh }: UseBoundaryActionsProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [impactAnalysisData, setImpactAnalysisData] = useState<ImpactAnalysis | null>(null);

  const analyze = async () => {
    if (!selectedRegion) return;
    try {
      setLoading(true);
      setError(null);
      const analysis = await analyzeImpact(selectedRegion.id);
      setImpactAnalysisData(analysis.impact);
      return analysis.impact;
    } catch (err: any) {
      const msg = err.message || "Failed to analyze impact";
      setError(msg);
      if (onError) onError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const publishDraft = async (reason: string) => {
    if (!selectedRegion || !reason.trim()) return;
    try {
      setLoading(true);
      setError(null);
      
      // Use the dedicated publish endpoint which promotes the draft
      await publishDraftBoundary(selectedRegion.id, reason);
      
      onSuccess("Boundary published successfully!");
      // Clear cache to ensure new boundary is loaded on map
      await boundaryCache.clear();
      onRefresh();
      setImpactAnalysisData(null);
    } catch (err: any) {
      const msg = err.message || "Failed to publish boundary";
      setError(msg);
      if (onError) onError(msg);
      throw err;
    } finally {
        setLoading(false);
    }
  };

  const publishVersion = async (version: BoundaryVersion, reason: string) => {
      if(!selectedRegion || !version) return;
      try {
          setLoading(true);
          // Revert/Rollback to this specific version
          await revertBoundaryToVersion(selectedRegion.id, version.versionNumber, reason);
          onSuccess(`Version ${version.versionNumber} published as new active boundary`);
          // Clear cache on revert too
          await boundaryCache.clear();
          onRefresh();
      } catch(err: any) {
          const msg = err.message || "Failed to republish version";
          setError(msg);
          if (onError) onError(msg);
      } finally {
          setLoading(false);
      }
  };

  const discard = async () => {
    if (!selectedRegion) return;
    try {
      setLoading(true);
      await discardDraft(selectedRegion.id);
      onSuccess("Draft discarded successfully");
      onRefresh();
      setImpactAnalysisData(null);
    } catch (err: any) {
      const msg = err.message || "Failed to discard draft";
      setError(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const unpublish = async (reason: string) => {
      if(!selectedRegion) return;
      try {
          setLoading(true);
          const response = await unpublishBoundary(selectedRegion.id, reason);
          onSuccess(response?.message || "Boundary unpublished and saved as draft");
          await boundaryCache.clear();
          onRefresh();
      } catch(err: any) {
          const msg = err.message || "Failed to unpublish";
          setError(msg);
          if (onError) onError(msg);
      } finally {
          setLoading(false);
      }
  };

  const deleteAll = async (reason: string) => {
      if(!selectedRegion) return;
      try {
          setLoading(true);
          await deleteAllBoundaryData(selectedRegion.id, reason);
          onSuccess("All boundary data deleted");
          await boundaryCache.clear();
          onRefresh();
      } catch(err: any) {
          const msg = err.message || "Failed to delete all data";
          setError(msg);
          if (onError) onError(msg);
      } finally {
          setLoading(false);
      }
  };

  return {
    loading,
    error,
    impactAnalysisData,
    setImpactAnalysisData,
    analyze,
    publishDraft,
    publishVersion,
    discard,
    unpublish,
    deleteAll,
  };
};

