
import type { AppMode } from '../../../types/common/index';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  autoClose?: boolean;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data?: any;
}

export interface PanelState {
  id: string;
  isVisible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
}

export interface UIState {
  // App Mode and Environment
  appMode: AppMode;
  isFullscreen: boolean;

  // Theme
  isDarkMode: boolean;
  theme: 'light' | 'dark' | 'auto';

  // Layout
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Loading States
  isGlobalLoading: boolean;
  loadingMessage: string;

  // Notifications
  notifications: Notification[];

  // Modals
  modal: ModalState;

  // Panels (Draggable/Resizable)
  panels: PanelState[];

  // Navigation
  activeTab: string;
  breadcrumbs: Array<{ label: string; path: string }>;

  // Mobile
  isMobileMenuOpen: boolean;

  // Performance
  showFPS: boolean;
  showDebugInfo: boolean;
}

