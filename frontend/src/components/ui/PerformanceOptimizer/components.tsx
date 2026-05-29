import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { VirtualizedListProps, DebouncedInputProps, LazyComponentProps, OptimizedImageProps } from './types';

export const VirtualizedList: React.FC<VirtualizedListProps> = memo(({ items, itemHeight, containerHeight, renderItem, overscan = 5 }) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleItems = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({ item, index: startIndex + index, top: (startIndex + index) * itemHeight }));
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);
  const totalHeight = items.length * itemHeight;
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => { setScrollTop(e.currentTarget.scrollTop); }, []);
  return (
    <div ref={containerRef} style={{ height: containerHeight, overflow: 'auto' }} onScroll={handleScroll}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top }) => (
          <div key={index} style={{ position: 'absolute', top, left: 0, right: 0, height: itemHeight }}>{renderItem(item, index)}</div>
        ))}
      </div>
    </div>
  );
});
VirtualizedList.displayName = 'VirtualizedList';

export const DebouncedInput: React.FC<DebouncedInputProps> = memo(({ onDebouncedChange, debounceMs = 300, ...props }) => {
  const [value, setValue] = React.useState(props.value || '');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { onDebouncedChange(newValue); }, debounceMs);
  }, [onDebouncedChange, debounceMs]);
  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }; }, []);
  return <input {...props} value={value} onChange={handleChange} />;
});
DebouncedInput.displayName = 'DebouncedInput';

export const LazyComponent: React.FC<LazyComponentProps> = ({ children, fallback = <div>Loading...</div>, threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return <div ref={ref}>{isVisible ? children : fallback}</div>;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({ src, alt, lazy = true, placeholder, ...props }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const handleLoad = useCallback(() => { setLoaded(true); }, []);
  const handleError = useCallback(() => { setError(true); }, []);
  if (error) return <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Failed to load image</div>;
  return (
    <div className="relative">
      {!loaded && placeholder && <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />}
      <img {...props} src={src} alt={alt} loading={lazy ? 'lazy' : 'eager'} onLoad={handleLoad} onError={handleError} style={{ ...props.style, opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }} />
    </div>
  );
});
OptimizedImage.displayName = 'OptimizedImage';

