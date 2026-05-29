import React from 'react';
import { useAppSelector } from '../../../store/index';
import { config, getVersionInfo } from '../../../utils/environment/index';
import { ModeIndicatorProps, getPositionClasses, getModeStyles, formatMode } from './types';

export const ModeIndicator: React.FC<ModeIndicatorProps> = ({
  position = 'bottom-right',
  showVersion = true,
  showEnvironment = true,
  compact = false,
  className = '',
}) => {
  const { appMode } = useAppSelector((state) => state.ui);
  const versionInfo = getVersionInfo();

  if (!config.ui.showModeIndicator && appMode === 'production') {
    return null;
  }

  const styles = getModeStyles(appMode);
  const positionClasses = getPositionClasses(position);

  if (compact) {
    return (
      <div
        className={`fixed ${positionClasses} z-50 ${styles.bg} ${styles.text} ${styles.border} px-2 py-1 rounded-md border text-xs font-medium shadow-lg ${styles.glow} backdrop-blur-sm transition-all duration-300 hover:scale-105 ${className}`}
        title={`Mode: ${formatMode(appMode)} | Environment: ${versionInfo.environment} | Version: ${versionInfo.version}`}
      >
        {formatMode(appMode)}
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses} z-50 ${styles.bg} ${styles.text} px-4 py-2.5 rounded-full min-w-max shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-3xl border-2 border-white/20 ${className}`}>
      <div className="flex items-center space-x-2.5">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-white animate-ping opacity-75" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-wide">{formatMode(appMode)} MODE</span>
            {versionInfo.debug && (
              <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-full font-semibold">DEBUG</span>
            )}
          </div>
          {(showEnvironment || showVersion) && (
            <div className="flex items-center space-x-2 text-xs opacity-95 mt-0.5">
              {showEnvironment && <span className="font-medium">{versionInfo.environment}</span>}
              {showVersion && showEnvironment && <span className="opacity-60">•</span>}
              {showVersion && <span className="font-medium">v{versionInfo.version}</span>}
            </div>
          )}
        </div>
        {appMode === 'maintenance' && (
          <div className="ml-2 text-xs px-2 py-1 bg-white/30 rounded-full font-bold">⚠️ MAINTENANCE</div>
        )}
      </div>
    </div>
  );
};

export default ModeIndicator;

