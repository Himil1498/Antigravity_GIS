// Types for CircleDrawingInteractive guide component

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

export type ColorMap = Record<string, string>;

