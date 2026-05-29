// Type definitions for PolygonDrawingInteractive

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

export interface VisualElement {
  icon: string;
  title: string;
  description: string;
}

export interface QuickAccessItem {
  number: string;
  title: string;
  description: string;
  colorClass: string;
}

export interface ProTip {
  icon: string;
  title: string;
  description: string;
}

