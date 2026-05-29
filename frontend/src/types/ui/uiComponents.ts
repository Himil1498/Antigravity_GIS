
import type { Position, Size } from '../common/index';

// Modal Types
export interface ModalState {
  activeModals: Modal[];
  modalStack: string[];
  backdropDismiss: boolean;
  escapeKeyDismiss: boolean;
}

export interface Modal {
  id: string;
  type: ModalType;
  title?: string;
  content: React.ReactNode | string;
  size: ModalSize;
  position: ModalPosition;
  options: ModalOptions;
  data?: Record<string, any>;
  isOpen: boolean;
  zIndex: number;
}

export type ModalType =
  | 'dialog'
  | 'drawer'
  | 'bottomSheet'
  | 'popup'
  | 'tooltip'
  | 'confirmation'
  | 'loading'
  | 'error'
  | 'custom';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';

export type ModalPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';

export interface ModalOptions {
  closeButton: boolean;
  backdrop: boolean;
  backdropDismiss: boolean;
  escapeKeyDismiss: boolean;
  focusTrap: boolean;
  restoreFocus: boolean;
  preventScroll: boolean;
  animated: boolean;
  persistent: boolean;
}

// Notification Types
export interface NotificationState {
  notifications: Notification[];
  maxNotifications: number;
  position: NotificationPosition;
  autoClose: boolean;
  defaultDuration: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  autoClose: boolean;
  isVisible: boolean;
  timestamp: string;
  actions?: NotificationAction[];
  icon?: string;
  image?: string;
  progress?: number;
  metadata?: Record<string, any>;
}

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'loading'
  | 'progress'
  | 'system'
  | 'user';

export type NotificationPosition =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight'
  | 'centerLeft'
  | 'centerRight'
  | 'center';

export interface NotificationAction {
  label: string;
  action: string;
  style?: 'primary' | 'secondary' | 'ghost';
  handler: () => void;
}

// Panel Types
export interface PanelState {
  panels: Panel[];
  maxPanels: number;
  snapToGrid: boolean;
  gridSize: number;
  bounds: PanelBounds;
}

export interface Panel {
  id: string;
  title: string;
  content: React.ReactNode;
  position: Position;
  size: Size;
  minSize: Size;
  maxSize: Size;
  isVisible: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isDraggable: boolean;
  isResizable: boolean;
  zIndex: number;
  options: PanelOptions;
}

export interface PanelOptions {
  closable: boolean;
  minimizable: boolean;
  maximizable: boolean;
  resizable: boolean;
  draggable: boolean;
  collapsible: boolean;
  header: boolean;
  footer: boolean;
  padding: boolean;
  overflow: 'visible' | 'hidden' | 'scroll' | 'auto';
}

export interface PanelBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// Loading States
export interface LoadingState {
  global: GlobalLoading;
  components: ComponentLoading[];
  operations: OperationLoading[];
}

export interface GlobalLoading {
  isLoading: boolean;
  message?: string;
  progress?: number;
  blocking: boolean;
  showSpinner: boolean;
  showProgress: boolean;
}

export interface ComponentLoading {
  componentId: string;
  isLoading: boolean;
  message?: string;
  skeleton: boolean;
  spinner: boolean;
}

export interface OperationLoading {
  operationId: string;
  type: string;
  isLoading: boolean;
  progress?: number;
  message?: string;
  cancellable: boolean;
  estimatedTime?: number;
}

