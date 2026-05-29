// Types for GlobalSearchInteractive guide component

export interface Step {
  id: number;
  title: string;
  icon: string;
  color: string;
  action: string;
  result: string;
  details: string[];
}

export interface ColorClasses {
  bg: string;
  text: string;
  border: string;
}

export type ColorMap = Record<string, ColorClasses>;

