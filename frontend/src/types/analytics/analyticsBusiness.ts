
import type { TelecomCompany, NetworkTechnology } from '../common/index';

// Business Analytics
export interface BusinessMetrics {
  timestamp: string;
  revenue: RevenueMetrics;
  costs: CostMetrics;
  roi: ROIMetrics;
  market: MarketMetrics;
  customer: CustomerMetrics;
}

export interface RevenueMetrics {
  total_revenue: number;
  recurring_revenue: number;
  one_time_revenue: number;
  revenue_per_tower: number;
  revenue_per_customer: number;
  growth_rate: number;
  forecast: number;
  by_company: Record<TelecomCompany, number>;
  by_technology: Record<NetworkTechnology, number>;
  by_region: Record<string, number>;
}

export interface CostMetrics {
  operational_costs: number;
  maintenance_costs: number;
  infrastructure_costs: number;
  personnel_costs: number;
  utility_costs: number;
  licensing_costs: number;
  cost_per_tower: number;
  cost_per_customer: number;
  cost_breakdown: Record<string, number>;
}

export interface ROIMetrics {
  total_roi: number;
  tower_roi: number;
  technology_roi: Record<NetworkTechnology, number>;
  payback_period: number; // months
  net_present_value: number;
  internal_rate_of_return: number;
  break_even_point: string; // date
}

export interface MarketMetrics {
  market_share: number;
  market_penetration: number;
  competitive_position: string;
  growth_opportunities: number;
  threat_level: 'low' | 'medium' | 'high';
  market_trends: MarketTrend[];
}

export interface MarketTrend {
  trend_name: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // percentage
  time_horizon: 'short' | 'medium' | 'long';
  affected_metrics: string[];
}

export interface CustomerMetrics {
  total_customers: number;
  active_customers: number;
  new_customers: number;
  churned_customers: number;
  churn_rate: number;
  customer_lifetime_value: number;
  customer_acquisition_cost: number;
  customer_satisfaction: number;
  net_promoter_score: number;
  support_tickets: number;
  resolution_time: number;
}


