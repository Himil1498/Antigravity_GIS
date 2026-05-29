
import type { Position, Size, AppMode } from '../common/index';
import type { ThemeType } from './uiTheme';
import type { ModalState } from './uiComponents';
import type { NotificationState } from './uiComponents';
import type { PanelState } from './uiComponents';
import type { LoadingState } from './uiComponents';
import type { PerformanceState } from './uiPerformance';

// UI State Management

export interface UIState {
  appMode: AppMode;
  isFullscreen: boolean;
  isDarkMode: boolean;
  theme: ThemeType;
  layout: LayoutState;
  navigation: NavigationState;
  modals: ModalState;
  notifications: NotificationState;
  panels: PanelState;
  loading: LoadingState;
  performance: PerformanceState;
}

// Layout Types
export interface LayoutState {
  sidebar: SidebarState;
  header: HeaderState;
  footer: FooterState;
  workspace: WorkspaceState;
  responsive: ResponsiveState;
}

export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  width: number;
  position: 'left' | 'right';
  variant: 'permanent' | 'temporary' | 'mini';
  activeSection: string;
}

export interface HeaderState {
  isVisible: boolean;
  height: number;
  isSticky: boolean;
  variant: 'default' | 'compact' | 'extended';
  showBreadcrumbs: boolean;
  showSearch: boolean;
}

export interface FooterState {
  isVisible: boolean;
  height: number;
  isSticky: boolean;
  content: 'default' | 'minimal' | 'detailed';
}

export interface WorkspaceState {
  layout: 'grid' | 'tabs' | 'split' | 'stack';
  activeWorkspace: string;
  workspaces: WorkspaceConfig[];
}

export interface WorkspaceConfig {
  id: string;
  name: string;
  icon?: string;
  layout: string;
  components: ComponentConfig[];
  isActive: boolean;
  isDirty?: boolean; // added optional property
}

export interface ComponentConfig {
  id: string;
  type: string;
  position: Position;
  size: Size;
  props: Record<string, any>;
  isVisible: boolean;
  isResizable: boolean;
  isDraggable: boolean;
}

export interface ResponsiveState {
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  dimensions: {
    width: number;
    height: number;
  };
}

// Navigation Types
export interface NavigationState {
  currentRoute: string;
  previousRoute: string;
  breadcrumbs: Breadcrumb[];
  menuItems: MenuItem[];
  activeTab: string;
  history: NavigationHistory[];
}

export interface Breadcrumb {
  label: string;
  path: string;
  icon?: string;
  isActive: boolean;
  isClickable: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: string;
  children?: MenuItem[];
  isActive: boolean;
  isVisible: boolean;
  permissions?: string[];
  order: number;
}

export interface NavigationHistory {
  path: string;
  timestamp: string;
  title: string;
  params?: Record<string, any>;
}

