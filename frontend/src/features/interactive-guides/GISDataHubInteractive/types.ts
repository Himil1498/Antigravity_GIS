// Types for GISDataHubInteractive guide component

export interface Step {
  id: number;
  title: string;
  icon: string;
  color: string;
  action: string;
  result: string;
  details: string[];
}

export interface DataType {
  name: string;
  icon: string;
  color: string;
  desc: string;
}

export interface ExportFormat {
  name: string;
  icon: string;
  desc: string;
  color: string;
}

export interface InfrastructureCategory {
  name: string;
  icon: string;
  desc: string;
}

export interface CustomerCompany {
  name: string;
  icon: string;
  full: string;
}

export interface AccessMethod {
  number: string;
  title: string;
  desc: string;
  color: string;
}

export interface StorageComparisonRow {
  feature: string;
  permanent: string;
  temporary: string;
}

export type ColorMap = Record<string, string>;

