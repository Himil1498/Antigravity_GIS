
import { UIState } from './types';

// Helper function to determine initial dark mode state
const getInitialDarkMode = (): boolean => {
  const savedTheme = localStorage.getItem('opti_connect_theme');

  if (savedTheme === 'dark') return true;
  if (savedTheme === 'light') return false;

  // If 'auto' or not set, check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const initialState: UIState = {
  appMode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  isFullscreen: false,

  isDarkMode: getInitialDarkMode(),
  theme: (localStorage.getItem('opti_connect_theme') as 'light' | 'dark' | 'auto') || 'auto',

  sidebarOpen: true,
  sidebarCollapsed: false,

  isGlobalLoading: false,
  loadingMessage: '',

  notifications: [],

  modal: {
    isOpen: false,
    type: null,
  },

  panels: [],

  activeTab: 'dashboard',
  breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }],

  isMobileMenuOpen: false,

  showFPS: false,
  showDebugInfo: false,
};

