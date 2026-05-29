import React, { memo, useRef, useEffect } from 'react';
import { config } from '../../../utils/environment/index';
import { PerformanceData, MemoryInfo } from './types';

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const performanceRef = useRef<PerformanceData>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    maxRenderTime: 0,
  });

  useEffect(() => {
    if (!config.features.debugging) return;
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      performanceRef.current.renderCount++;
      performanceRef.current.lastRenderTime = renderTime;
      const count = performanceRef.current.renderCount;
      const currentAvg = performanceRef.current.averageRenderTime;
      performanceRef.current.averageRenderTime = (currentAvg * (count - 1) + renderTime) / count;
      if (renderTime > performanceRef.current.maxRenderTime) {
        performanceRef.current.maxRenderTime = renderTime;
      }
      if (renderTime > 16.67) {
        console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`, {
          component: 'PerformanceOptimizer',
          renderCount: count,
          averageRenderTime: performanceRef.current.averageRenderTime.toFixed(2),
        });
      }
    };
  });
  return performanceRef.current;
};

// Memory management hook
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = React.useState<MemoryInfo>({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
  });

  useEffect(() => {
    if (!config.features.debugging || !('memory' in performance)) return;
    const updateMemoryInfo = () => {
      const memory = (performance as any).memory;
      setMemoryInfo({
        usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576),
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576),
        jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576),
      });
    };
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// Optimized component wrapper (HOC)
export const withPerformanceOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  options: { memo?: boolean; displayName?: string; areEqual?: (prevProps: P, nextProps: P) => boolean } = {}
) => {
  const { memo: shouldMemo = true, displayName, areEqual } = options;
  const OptimizedComponent = shouldMemo ? memo(Component, areEqual) : Component;
  if (displayName) {
    OptimizedComponent.displayName = displayName;
  }
  return OptimizedComponent;
};

