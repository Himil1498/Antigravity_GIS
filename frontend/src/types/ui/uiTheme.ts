
// Theme Types
export type ThemeType = 'light' | 'dark' | 'auto' | 'high_contrast';

export interface ThemeConfig {
  name: string;
  type: ThemeType;
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  animations: ThemeAnimations;
}

export interface ThemeColors {
  primary: ColorPalette;
  secondary: ColorPalette;
  accent: ColorPalette;
  neutral: ColorPalette;
  semantic: SemanticColors;
  surfaces: SurfaceColors;
  text: TextColors;
  borders: BorderColors;
}

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
  successLight: string;
  warningLight: string;
  errorLight: string;
  infoLight: string;
}

export interface SurfaceColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  overlay: string;
  modal: string;
  popover: string;
  tooltip: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  inverse: string;
  onPrimary: string;
  onSecondary: string;
  onSurface: string;
}

export interface BorderColors {
  default: string;
  subtle: string;
  strong: string;
  interactive: string;
  focus: string;
  error: string;
  success: string;
}

export interface ThemeFonts {
  sans: string[];
  serif: string[];
  mono: string[];
  display: string[];
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export interface ThemeAnimations {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

