
// Accessibility Types
export interface AccessibilityState {
  announcements: Announcement[];
  focusManagement: FocusManagement;
  keyboardNavigation: KeyboardNavigation;
  screenReader: ScreenReaderConfig;
}

export interface Announcement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: string;
}

export interface FocusManagement {
  focusVisible: boolean;
  focusTrap: boolean;
  restoreFocus: boolean;
  skipLinks: SkipLink[];
}

export interface SkipLink {
  id: string;
  label: string;
  target: string;
  visible: boolean;
}

export interface KeyboardNavigation {
  enabled: boolean;
  tabIndex: number;
  shortcuts: KeyboardShortcut[];
}

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  action: string;
  context?: string;
  enabled: boolean;
}

export interface ScreenReaderConfig {
  announcePageChanges: boolean;
  announceFormErrors: boolean;
  announceLoadingStates: boolean;
  verbosity: 'minimal' | 'normal' | 'verbose';
}

