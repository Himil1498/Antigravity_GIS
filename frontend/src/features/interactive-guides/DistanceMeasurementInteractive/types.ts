// Types for DistanceMeasurementInteractive guide component

export interface Step {
  id: number;
  title: string;
  icon: string;
  color: string;
  action: string;
  result: string;
  details: string[];
}

export interface StorageComparisonRow {
  feature: string;
  permanent: string;
  temporary: string;
}

export type ColorMap = Record<string, string>;

