import React from 'react';
import { useAppSelector } from '../../../store/index';
import { FooterProps } from './types';
import { useFooterState, formatTime, formatDate, getModeColor } from './useFooter';
import { DetailedFooter } from './DetailedFooter';
import { getVersionInfo } from '../../../utils/environment/index';

const Footer: React.FC<FooterProps> = ({
  className = '',
  position = 'relative',
  showDetails = true,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { appMode } = useAppSelector((state) => state.ui);
  const { currentTime, backendHealth, backendConnected, latency, lastSyncTime } = useFooterState();
  const versionInfo = getVersionInfo();

  const positionClass = position === 'fixed' ? 'fixed bottom-0 left-0 right-0 z-50' : 'relative mt-auto';

  return (
    <footer className={`${positionClass} backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-t border-gray-200/50 dark:border-gray-700/50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] ${className}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {showDetails ? (
          <DetailedFooter
            user={user}
            appMode={appMode}
            currentTime={currentTime}
            backendHealth={backendHealth}
            backendConnected={backendConnected}
            latency={latency}
            lastSyncTime={lastSyncTime}
          />
        ) : (
          <div className="py-3 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-700 dark:text-gray-300">Opti Connect GIS</span>
              <span>v{versionInfo.version}</span>
              <span className={`font-medium ${getModeColor(appMode)}`}>{appMode}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>{formatTime(currentTime)}</span>
              <span>{formatDate(currentTime)}</span>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;

