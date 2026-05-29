import { useState, useEffect, useCallback } from "react";
import { apiService } from "../../../services/api/index";
import { InfrastructureStats } from '../types/infrastructure.types';
import { calculateStats, getEmptyStats } from '../utils/statsUtils';

interface UseInfrastructureStatsResult {
  stats: InfrastructureStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useInfrastructureStats = (
  userDataOnly: boolean
): UseInfrastructureStatsResult => {
  const [stats, setStats] = useState<InfrastructureStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfrastructureStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const debugResponse = await apiService.get(
          "/infrastructure/debug/counts"
        );
        if (debugResponse.data && debugResponse.data.success) {
          // Debug endpoint called successfully
        }
      } catch (debugErr) {
        console.warn("DEBUG endpoint failed:", debugErr);
      }

      const queryParams = new URLSearchParams();

      if (userDataOnly) {
        queryParams.append("sortBy", "created_at");
        queryParams.append("sortOrder", "DESC");
      } else {
        queryParams.append("filter", "all");
        queryParams.append("sortBy", "created_at");
        queryParams.append("sortOrder", "DESC");
      }

      const endpoint = `/infrastructure?${queryParams.toString()}`;
      const response = await apiService.get(endpoint);

      if (response.data && response.data.success) {
        const infrastructures: any[] =
          response.data.items || response.data.data || [];

        const calculatedStats = calculateStats(infrastructures);
        setStats(calculatedStats);
      } else {
        setError(
          response.data?.error ||
            response.data?.message ||
            "Failed to load infrastructure data"
        );
      }
    } catch (err: any) {
      console.error("Error fetching infrastructure stats:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load infrastructure statistics"
      );

      setStats(getEmptyStats());
    } finally {
      setLoading(false);
    }
  }, [userDataOnly]);

  useEffect(() => {
    fetchInfrastructureStats();
    const interval = setInterval(fetchInfrastructureStats, 300000);
    return () => clearInterval(interval);
  }, [fetchInfrastructureStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchInfrastructureStats,
  };
};

