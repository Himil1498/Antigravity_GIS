// Type definitions for MainNavigationInteractive

export interface Step {
  id: number;
  title: string;
  icon: string;
  color: string;
  action: string;
  result: string;
  details: string[];
}

export interface NavigationTab {
  name: string;
  icon: string;
  color: string;
  access: string;
  desc: string;
}

export interface Role {
  name: string;
  icon: string;
  color: string;
  access: string;
  tabs: number;
  permissions: string[];
}

export interface GISTool {
  name: string;
  icon: string;
  color: string;
  desc: string;
}

export interface KeyFeature {
  title: string;
  icon: string;
  color: string;
  points: string[];
}

export interface ProTip {
  title: string;
  content: string;
}

export interface QuickRefItem {
  icon: string;
  title: string;
  items: string[];
}

