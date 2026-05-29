import { useState, useEffect, useCallback } from "react";
import { 
  getDraftBoundary, 
  getRegionBoundary, 
  getRegionBoundaryVersions, 
  Region,
  Boundary, 
  BoundaryVersion 
} from "../../../../services/region/index";
import { apiService } from "../../../../services/api/index";
import { InfrastructureStats } from "../types/index";
import { INITIAL_INFRASTRUCTURE_STATS } from "../constants/index";

export const useBoundaryData = (selectedRegion: Region | null) => {
  const [draftExists, setDraftExists] = useState(false);
  const [currentBoundary, setCurrentBoundary] = useState<Boundary | null>(null);
  const [versions, setVersions] = useState<BoundaryVersion[]>([]);
  const [totalVersions, setTotalVersions] = useState(0);
  const [publishedVersionsCount, setPublishedVersionsCount] = useState(0);
  const [infrastructureStats, setInfrastructureStats] = useState<InfrastructureStats>(INITIAL_INFRASTRUCTURE_STATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDraftExists = useCallback(async () => {
    if (!selectedRegion) return;
    try {
      const response = await getDraftBoundary(selectedRegion.id);
      setDraftExists(!!response && !!response.draft);
    } catch (err: any) {
      setDraftExists(false);
    }
  }, [selectedRegion]);

  const loadBoundaryData = useCallback(async () => {
    if (!selectedRegion) return;
    try {
      const response = await getRegionBoundary(selectedRegion.id);
      if (response?.boundary && response.boundary.id) {
        setCurrentBoundary(response.boundary);
      } else {
        setCurrentBoundary(null);
      }
    } catch (err: any) {
      console.log(`No published boundary for ${selectedRegion.name}`);
      setCurrentBoundary(null);
    }
  }, [selectedRegion]);

  const loadVersionHistory = useCallback(async () => {
    if (!selectedRegion) return;
    try {
      const response: any = await getRegionBoundaryVersions(selectedRegion.id);
      // Backend returns { history: [], total: N }
      const allVersions = response.history || response.versions || [];
      setVersions(allVersions);
      setTotalVersions(response.total || allVersions.length);
      const publishedCount = allVersions.filter((v: BoundaryVersion) => v.status === 'published').length;
      setPublishedVersionsCount(publishedCount);
    } catch (err: any) {
      console.error("Failed to load version history", err);
    }
  }, [selectedRegion]);

  const loadInfrastructureStats = useCallback(async () => {
    if (!selectedRegion) return;
    try {
      // Infrastructure loading removed as it is deprecated
      // const items = await apiService.getAllInfrastructure({ regionId: selectedRegion.id });
      const stats = { ...INITIAL_INFRASTRUCTURE_STATS };
      /* Infrastructure stats deprecated
      items.forEach((item: any) => {
        const itemType = item.item_type || '';
        if (itemType in stats) {
          stats[itemType as keyof InfrastructureStats]++;
        }
      });
      */
      setInfrastructureStats(stats);
    } catch (err: any) {
      console.error('Failed to load infrastructure stats:', err);
      // Keep default values on error
    }
  }, [selectedRegion]);

  const refreshAll = useCallback(async () => {
    if (!selectedRegion) {
        setDraftExists(false);
        setCurrentBoundary(null);
        setVersions([]);
        setTotalVersions(0);
        setPublishedVersionsCount(0);
        setInfrastructureStats(INITIAL_INFRASTRUCTURE_STATS);
        return;
    }
    
    setLoading(true);
    setError(null);
    try {
        await Promise.all([
            checkDraftExists(),
            loadBoundaryData(),
            loadVersionHistory(),
            loadInfrastructureStats()
        ]);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  }, [selectedRegion, checkDraftExists, loadBoundaryData, loadVersionHistory, loadInfrastructureStats]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    draftExists,
    currentBoundary,
    versions,
    totalVersions,
    publishedVersionsCount,
    infrastructureStats,
    loading,
    error,
    refreshAll
  };
};

