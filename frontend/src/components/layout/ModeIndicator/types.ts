export interface ModeIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showVersion?: boolean;
  showEnvironment?: boolean;
  compact?: boolean;
  className?: string;
}

export interface SystemStatusProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetails?: boolean;
  className?: string;
}

export type SystemHealth = 'healthy' | 'degraded' | 'unhealthy';
export type ApiStatus = 'connected' | 'disconnected' | 'slow';

export const getPositionClasses = (position: string) => {
  switch (position) {
    case 'top-left':
      return 'top-4 left-4';
    case 'top-right':
      return 'top-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'bottom-right':
    default:
      return 'bottom-4 right-4';
  }
};

export const getModeStyles = (appMode: string) => {
  switch (appMode) {
    case 'development':
      return { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600', glow: 'shadow-blue-500/20' };
    case 'testing':
      return { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-600', glow: 'shadow-yellow-500/20' };
    case 'maintenance':
      return { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600', glow: 'shadow-red-500/20' };
    case 'production':
    default:
      return { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600', glow: 'shadow-green-500/20' };
  }
};

export const formatMode = (mode: string) => mode.charAt(0).toUpperCase() + mode.slice(1);

