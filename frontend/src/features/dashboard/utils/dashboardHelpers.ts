import type { LatencyDataPoint, TimeRange, TrendDataPoint, UsageTrendsData, UsageTotals, PerformanceData } from '../types/dashboardTypes';

/**
 * Format relative time from timestamp
 */
export const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffMs = now.getTime() - activityTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60)
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return activityTime.toLocaleDateString();
};

/**
 * Format latency value
 */
export const formatLatency = (value: number): string => `${value.toFixed(2)}ms`;

/**
 * Format performance chart time based on selected time range
 */
export const formatPerfTime = (timestamp: string, selectedPerfTimeRange: TimeRange): string => {
  try {
    const date = new Date(timestamp);
    if (selectedPerfTimeRange === "1h") {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else if (selectedPerfTimeRange === "24h") {
      return date.toLocaleTimeString("en-US", { hour: "2-digit" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    }
  } catch {
    return timestamp;
  }
};

/**
 * Format usage trends date
 */
export const formatUsageDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  } catch {
    return dateStr;
  }
};

/**
 * Calculate success rate from performance data
 */
export const calculateSuccessRate = (performanceData: PerformanceData | null): string => {
  if (!performanceData?.overall) return "0";
  const total = performanceData.overall.total_requests;
  if (total === 0) return "0";
  return ((performanceData.overall.successful_requests / total) * 100).toFixed(2);
};

/**
 * Get total for a single date point
 */
export const getTotalForDate = (dataPoint: TrendDataPoint): number => {
  return (
    dataPoint.distance +
    dataPoint.polygon +
    dataPoint.elevation +
    dataPoint.circle +
    dataPoint.sector_rf
  );
};

/**
 * Calculate grand totals from usage trends data
 */
export const getGrandTotal = (usageTrendsData: UsageTrendsData | null): UsageTotals => {
  if (!usageTrendsData?.trends)
    return {
      distance: 0,
      polygon: 0,
      elevation: 0,
      circle: 0,
      sector_rf: 0,
      total: 0
    };

  const totals = usageTrendsData.trends.reduce(
    (acc, point) => ({
      distance: acc.distance + point.distance,
      polygon: acc.polygon + point.polygon,
      elevation: acc.elevation + point.elevation,
      circle: acc.circle + point.circle,
      sector_rf: acc.sector_rf + point.sector_rf
    }),
    {
      distance: 0,
      polygon: 0,
      elevation: 0,
      circle: 0,
      sector_rf: 0
    }
  );

  return {
    ...totals,
    total:
      totals.distance +
      totals.polygon +
      totals.elevation +
      totals.circle +
      totals.sector_rf
  };
};

/**
 * Transform latency data for charts
 */
export const transformPerfChartData = (
  latencyOverTime: LatencyDataPoint[] | undefined,
  selectedPerfTimeRange: TimeRange
) => {
  if (!latencyOverTime) return [];

  return latencyOverTime.map((point) => ({
    time: formatPerfTime(point.time_bucket, selectedPerfTimeRange),
    avgLatency: parseFloat(point.avg_latency?.toString() || "0"),
    minLatency: parseFloat(point.min_latency?.toString() || "0"),
    maxLatency: parseFloat(point.max_latency?.toString() || "0"),
    requests: parseInt(point.request_count?.toString() || "0")
  }));
};

