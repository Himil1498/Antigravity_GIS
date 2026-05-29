export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoadingColor = 'blue' | 'white' | 'gray';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray';
  className?: string;
}

export interface LoadingOverlayProps {
  message?: string;
  transparent?: boolean;
  className?: string;
}

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export interface LoadingCardProps {
  count?: number;
  className?: string;
}

export interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
  className?: string;
}

export interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface InlineLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

