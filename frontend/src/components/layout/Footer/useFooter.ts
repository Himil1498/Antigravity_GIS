import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api/index';
import { BackendHealth } from './types';

export const useFooterState = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Fetch backend health
  const fetchBackendHealth = async () => {
    try {
      const startTime = performance.now();
      const response = await apiService.get('/health');
      const endTime = performance.now();
      
      if (response.data && response.data.success) {
        setBackendHealth(response.data);
        setBackendConnected(true);
        setLatency(Math.round(endTime - startTime));
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch backend health:', error);
      setBackendConnected(false);
      setLatency(null);
    }
  };

  // Initial backend health check
  useEffect(() => {
    fetchBackendHealth();
    // Refresh backend health every 60 seconds for more lively updates
    const healthInterval = setInterval(fetchBackendHealth, 60000);
    return () => clearInterval(healthInterval);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return { currentTime, backendHealth, backendConnected, latency, lastSyncTime };
};

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getModeColor = (appMode: string) => {
  switch (appMode) {
    case 'development':
      return 'text-blue-600 dark:text-blue-400';
    case 'testing':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'maintenance':
      return 'text-red-600 dark:text-red-400';
    case 'production':
      return 'text-green-600 dark:text-green-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

