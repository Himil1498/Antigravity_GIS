// Type definitions for LoginPageInteractive

export interface Step {
  id: number;
  title: string;
  icon: string;
  color: string;
  action: string;
  result: string;
  details: string[];
}

export interface SecurityFeature {
  name: string;
  icon: string;
  color: string;
  details: string;
}

export interface ProTip {
  title: string;
  content: string;
}

