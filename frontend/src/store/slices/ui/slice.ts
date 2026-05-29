
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppMode } from '../../../types/common/index';
import { Notification, ModalState, PanelState } from './types';
import { initialState } from './initialState';

let notificationIdCounter = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // App Mode
    setAppMode: (state, action: PayloadAction<AppMode>) => {
      state.appMode = action.payload;
    },

    // Fullscreen
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },

    setFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },

    // Theme
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      state.theme = state.isDarkMode ? 'dark' : 'light';
      localStorage.setItem('opti_connect_theme', state.theme);
    },

    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
      if (action.payload === 'auto') {
        state.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        state.isDarkMode = action.payload === 'dark';
      }
      localStorage.setItem('opti_connect_theme', action.payload);
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },

    // Loading
    setGlobalLoading: (state, action: PayloadAction<{ loading: boolean; message?: string }>) => {
      state.isGlobalLoading = action.payload.loading;
      state.loadingMessage = action.payload.message || '';
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification_${notificationIdCounter++}`,
        timestamp: Date.now(),
        autoClose: action.payload.autoClose ?? true,
        duration: action.payload.duration ?? 5000,
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Modals
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data,
      };
    },

    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: undefined,
      };
    },

    // Panels
    addPanel: (state, action: PayloadAction<Omit<PanelState, 'id'>>) => {
      const panel: PanelState = {
        ...action.payload,
        id: `panel_${Date.now()}`,
      };
      state.panels.push(panel);
    },

    updatePanel: (state, action: PayloadAction<{ id: string; updates: Partial<PanelState> }>) => {
      const index = state.panels.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.panels[index] = { ...state.panels[index], ...action.payload.updates };
      }
    },

    removePanel: (state, action: PayloadAction<string>) => {
      state.panels = state.panels.filter(p => p.id !== action.payload);
    },

    // Navigation
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },

    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; path: string }>>) => {
      state.breadcrumbs = action.payload;
    },

    // Mobile
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },

    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },

    // Debug
    toggleFPS: (state) => {
      state.showFPS = !state.showFPS;
    },

    toggleDebugInfo: (state) => {
      state.showDebugInfo = !state.showDebugInfo;
    },
  },
});

export const {
  setAppMode,
  toggleFullscreen,
  setFullscreen,
  toggleDarkMode,
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  setGlobalLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  addPanel,
  updatePanel,
  removePanel,
  setActiveTab,
  setBreadcrumbs,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleFPS,
  toggleDebugInfo,
} = uiSlice.actions;

export default uiSlice.reducer;

