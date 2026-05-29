// Types for AnalyticsInteractive guide component

export interface Step {
  id: number;
  title: string;
  icon: string;
  color: string;
  action: string;
  result: string;
  details: string[];
}

export interface SectionItem {
  name: string;
  desc: string;
}

export interface Section {
  title: string;
  icon: string;
  color: string;
  items: SectionItem[];
}

export interface Feature {
  title: string;
  icon: string;
  color: string;
  desc: string;
}

export type ColorMap = Record<string, string>;

