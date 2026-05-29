import React from 'react';
import { useAppSelector } from '../../../store/index';
import { config } from '../../../utils/environment/index';
import { SystemStatusProps, SystemHealth, ApiStatus, getPositionClasses } from './types';

export const SystemStatus: React.FC<SystemStatusProps> = ({
  position = 'top-right',
  showDetails = false,
  className = '',
}) => {
  const { isGlobalLoading } = useAppSelector((state) => state.ui);
  const { isMapLoaded } = useAppSelector((state) => state.map);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [systemHealth, setSystemHealth] = React.useState<SystemHealth>('healthy');
  const [apiStatus, setApiStatus] = React.useState<ApiStatus>('connected');

  React.useEffect(() => {
    const checkSystemHealth = () => {
      if (!isMapLoaded) {
        setSystemHealth('degraded');
      } else if (isGlobalLoading) {
        setSystemHealth('degraded');
      } else {
        setSystemHealth('healthy');
      }
      setApiStatus('connected');
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, [isMapLoaded, isGlobalLoading]);

  const getStatusColor = () => {
    switch (systemHealth) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
    }
  };

  if (!config.features.debugging) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses(position)} z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">System Status</span>
      </div>
      {showDetails && (
        <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Auth:</span>
            <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>{isAuthenticated ? 'OK' : 'No Auth'}</span>
          </div>
          <div className="flex justify-between">
            <span>Maps:</span>
            <span className={isMapLoaded ? 'text-green-600' : 'text-yellow-600'}>{isMapLoaded ? 'Loaded' : 'Loading'}</span>
          </div>
          <div className="flex justify-between">
            <span>API:</span>
            <span className={apiStatus === 'connected' ? 'text-green-600' : 'text-red-600'}>{apiStatus}</span>
          </div>
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="capitalize">{config.app.mode}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;

