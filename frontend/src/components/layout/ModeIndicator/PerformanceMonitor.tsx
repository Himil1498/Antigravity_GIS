import React from 'react';
import { config } from '../../../utils/environment/index';

interface PerformanceMonitorProps {
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ className = '' }) => {
  const [fps, setFps] = React.useState(60);
  const [memory, setMemory] = React.useState(0);

  React.useEffect(() => {
    if (!config.features.debugging) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(measureFPS);
    };

    const measureMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        setMemory(Math.round(memInfo.usedJSHeapSize / 1048576));
      }
    };

    measureFPS();
    measureMemory();
    const memoryInterval = setInterval(measureMemory, 5000);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(memoryInterval);
    };
  }, []);

  if (!config.features.debugging) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-40 z-40 bg-black/80 text-white px-3 py-1 rounded-md text-xs font-mono ${className}`}>
      <div className="flex space-x-4">
        <span>FPS: {fps}</span>
        <span>Memory: {memory}MB</span>
        <span>Mode: {config.app.mode}</span>
      </div>
    </div>
  );
};

export default PerformanceMonitor;

