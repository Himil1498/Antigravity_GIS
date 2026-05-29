
import { TrendData } from './types';

/**
 * Calculate User Engagement KPI
 * (Active Users / Total Users) × 100
 */
export const calculateUserEngagement = (activeUsers: number, totalUsers: number): number => {
  if (totalUsers === 0) return 0;
  return Math.round((activeUsers / totalUsers) * 100);
};

/**
 * Calculate Tool Adoption KPI
 * (Tools Used / Total Tools) × 100
 */
export const calculateToolAdoption = (usedTools: number, totalTools: number): number => {
  if (totalTools === 0) return 0;
  return Math.round((usedTools / totalTools) * 100);
};

/**
 * Calculate Regional Coverage KPI
 * (Active Regions / Total Regions) × 100
 */
export const calculateRegionalCoverage = (activeRegions: number, totalRegions: number): number => {
  if (totalRegions === 0) return 0;
  return Math.round((activeRegions / totalRegions) * 100);
};

/**
 * Calculate System Performance Score
 * Based on CPU, Memory, and Latency
 */
export const calculatePerformanceScore = (
  cpu: number,
  memory: number,
  latency: number
): number => {
  const cpuScore = Math.max(0, 100 - cpu);
  const memoryScore = Math.max(0, 100 - memory);
  const latencyScore = Math.max(0, 100 - latency / 10);

  return Math.round((cpuScore + memoryScore + latencyScore) / 3);
};

/**
 * Calculate Success Rate KPI
 * (Successful Operations / Total Operations) × 100
 */
export const calculateSuccessRate = (successful: number, total: number): number => {
  if (total === 0) return 100;
  return Math.round((successful / total) * 100);
};

/**
 * Calculate trend between two values
 */
export const calculateTrend = (current: number, previous: number): TrendData => {
  const change = current - previous;
  const changePercentage = previous === 0 ? 0 : Math.round((change / previous) * 100);

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (changePercentage > 5) trend = 'up';
  else if (changePercentage < -5) trend = 'down';

  return {
    current,
    previous,
    change,
    changePercentage,
    trend
  };
};

