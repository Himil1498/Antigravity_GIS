import React, { memo, useMemo, useEffect } from 'react';
import { useAppSelector } from '../../../store/index';
import { config } from '../../../utils/environment/index';
import { usePerformanceMonitor, useMemoryMonitor } from './hooks';

export const PerformanceAnalytics: React.FC = memo(() => {
  const performanceData = usePerformanceMonitor();
  const memoryData = useMemoryMonitor();
  const reduxState = useAppSelector((state) => state);

  const storeSize = useMemo(() => {
    try { return JSON.stringify(reduxState).length; } catch { return 0; }
  }, [reduxState]);

  if (!config.features.debugging) return null;

  return (
    <div className="fixed top-32 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-40">
      <div className="space-y-1">
        <div>Renders: {performanceData.renderCount}</div>
        <div>Last: {performanceData.lastRenderTime.toFixed(1)}ms</div>
        <div>Avg: {performanceData.averageRenderTime.toFixed(1)}ms</div>
        <div>Max: {performanceData.maxRenderTime.toFixed(1)}ms</div>
        <div>Memory: {memoryData.usedJSHeapSize}MB</div>
        <div>Store: {(storeSize / 1024).toFixed(1)}KB</div>
      </div>
    </div>
  );
});
PerformanceAnalytics.displayName = 'PerformanceAnalytics';

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (!config.features.debugging) return;
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn('Long task detected:', { duration: entry.duration, startTime: entry.startTime, name: entry.name });
        }
      });
    });
    observer.observe({ entryTypes: ['longtask'] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {children}
      <PerformanceAnalytics />
    </>
  );
};

