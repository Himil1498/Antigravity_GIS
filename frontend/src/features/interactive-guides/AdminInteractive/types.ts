// Types for AdminInteractive guide component

export interface Step {
  id: number;
  title: string;
  icon: string;
  color: string;
  action: string;
  result: string;
  details: string[];
}

export interface TabOverview {
  number: string;
  name: string;
  icon: string;
  color: string;
  purpose: string;
  features: string[];
}

export interface ProTip {
  title: string;
  content: string;
}

export type ColorMap = Record<string, string>;

