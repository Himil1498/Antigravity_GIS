// Type definitions for SectorRFInteractive

export interface Step {
  id: number;
  title: string;
  icon: string;
  color: string;
  action: string;
  result: string;
  details: string[];
}

export interface VisualElement {
  icon: string;
  title: string;
  description: string;
}

export interface RFParameter {
  param: string;
  range: string;
  desc: string;
}

export interface StorageComparisonRow {
  feature: string;
  permanent: string;
  temporary: string;
}

export interface AccessMethod {
  number: string;
  title: string;
  description: string;
  color: string;
}

export interface AzimuthDirection {
  icon: string;
  degrees: string;
  direction: string;
}

export interface BeamwidthConfig {
  title: string;
  subtitle: string;
  colorClass: string;
  textColorClass: string;
  items: string[];
}

export interface CoverageRange {
  icon: string;
  title: string;
  items: string[];
}

export interface KeyFeature {
  title: string;
  items: string[];
}

export interface UseCase {
  title: string;
  description: string;
}

