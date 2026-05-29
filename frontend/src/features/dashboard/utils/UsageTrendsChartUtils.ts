import type { TrendDataPoint } from '../types/dashboardTypes';

export interface UsageTrendsChartProps {
  data: TrendDataPoint[];
}

export const CHART_COLORS = {
  distance: "#3b82f6",
  polygon: "#a855f7",
  elevation: "#06b6d4",
  circle: "#eab308",
  sector_rf: "#f97316"
} as const;

export type ChartColorKeys = keyof typeof CHART_COLORS;

export const DEFAULT_TOTALS = {
  distance: 0,
  polygon: 0,
  elevation: 0,
  circle: 0,
  sector_rf: 0
};

export const formatLabel = (key: string) => key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ");

export const calculateTotals = (data: TrendDataPoint[]) => {
  if (!data || data.length === 0) return DEFAULT_TOTALS;
  return data.reduce((acc: any, point: any) => ({
    distance: acc.distance + point.distance,
    polygon: acc.polygon + point.polygon,
    elevation: acc.elevation + point.elevation,
    circle: acc.circle + point.circle,
    sector_rf: acc.sector_rf + point.sector_rf
  }), DEFAULT_TOTALS);
};

