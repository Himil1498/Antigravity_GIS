// Types for DashboardInteractive guide component

export interface Step {
  id: number;
  title: string;
  icon: string;
  color: string;
  action: string;
  result: string;
  details: string[];
}

export interface KPICard {
  name: string;
  icon: string;
  color: string;
  desc: string;
}

export interface ActivityType {
  type: string;
  color: string;
  icon: string;
  desc: string;
}

export interface HealthMetric {
  name: string;
  color: string;
  icon: string;
  calc: string;
  thresholds: string;
  display: string;
}

export interface Feature {
  title: string;
  icon: string;
  color: string;
  desc: string;
}

export type ColorMap = Record<string, string>;

