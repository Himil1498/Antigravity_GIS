import React from 'react';
import { LoadingSpinnerProps, LoadingOverlayProps, SkeletonProps, LoadingDotsProps } from './types';

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className = '',
}) => {
  const sizeClasses = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-3', xl: 'h-16 w-16 border-4' };
  const colorClasses = { blue: 'border-blue-600 border-t-transparent', white: 'border-white border-t-transparent', gray: 'border-gray-600 border-t-transparent' };
  return <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`} />;
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
  transparent = false,
  className = '',
}) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${transparent ? 'bg-black/30' : 'bg-white dark:bg-gray-900'} backdrop-blur-sm transition-all duration-300 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="xl" color={transparent ? 'white' : 'blue'} />
        {message && (
          <p className={`text-lg font-medium ${transparent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{message}</p>
        )}
      </div>
    </div>
  );
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const variantClasses = { text: 'rounded h-4', circular: 'rounded-full', rectangular: 'rounded-lg' };
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
    none: '',
  };
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={{ width: width || (variant === 'circular' ? '40px' : '100%'), height: height || (variant === 'circular' ? '40px' : undefined) }}
    />
  );
};

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  color = 'blue',
  className = '',
}) => {
  const sizeClasses = { sm: 'h-1.5 w-1.5', md: 'h-2.5 w-2.5', lg: 'h-4 w-4' };
  const colorClasses = { blue: 'bg-blue-600', white: 'bg-white', gray: 'bg-gray-600' };
  return (
    <div className={`flex items-center space-x-1.5 ${className}`}>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

export default LoadingSpinner;

