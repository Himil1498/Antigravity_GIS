
import type { BaseEntity, DateRange } from '../common/index';
import type { MetricCategory, MetricType, AggregationType, TimeGranularity } from './analyticsEnums';

// Core Analytics Types
export interface AnalyticsMetric extends BaseEntity {
  name: string;
  display_name: string;
  value: number;
  unit: string;
  category: MetricCategory;
  type: MetricType;
  aggregation: AggregationType;
  tags: string[];
  metadata: Record<string, any>;
}

// Time Series Data
export interface TimeSeriesData {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface TimeSeriesMetric {
  metric_id: string;
  name: string;
  data_points: TimeSeriesData[];
  granularity: TimeGranularity;
  range: DateRange;
  aggregation: AggregationType;
}


