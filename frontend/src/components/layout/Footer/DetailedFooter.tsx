import React from 'react';
import type { User } from '../../../types/auth/index';
import { config, getVersionInfo } from '../../../utils/environment/index';
import { BackendHealth } from './types';
import { formatTime, formatDate, getModeColor } from './useFooter';
import { useLogo } from '../../../contexts/LogoContext';

interface DetailedFooterProps {
  user: User | null;
  appMode: string;
  currentTime: Date;
  backendHealth: BackendHealth | null;
  backendConnected: boolean;
  latency?: number | null;
  lastSyncTime?: Date | null;
}

export const DetailedFooter: React.FC<DetailedFooterProps> = ({
  user, appMode, currentTime, backendHealth, backendConnected, latency, lastSyncTime
}) => {
  const versionInfo = getVersionInfo();
  const { logoPath } = useLogo();

  return (
    <div className="py-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
        {/* Left Section: Branding & System Mode */}
        <div className="flex flex-col space-y-3 w-full md:w-auto items-center md:items-start">
          <div className="flex items-center space-x-3 group">
            <div className="flex-shrink-0">
              <img
                src={logoPath}
                alt="OptiConnect GIS"
                className="h-12 w-auto object-contain scale-[1.5] origin-left transition-transform duration-300 hover:scale-[1.6] dark:brightness-0 dark:invert"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border border-current ${getModeColor(appMode)} bg-current/10`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
              {appMode}
            </span>
            {config.app.debug && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 rounded-md text-[10px] font-bold tracking-wider uppercase">
                DEBUG
              </span>
            )}
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-md text-[10px] font-bold tracking-wider uppercase">
              v{versionInfo.version}
            </span>
          </div>
        </div>

        {/* Right Section: Time & Sync Status */}
        <div className="flex flex-col space-y-2 md:items-end justify-center w-full md:w-auto items-center md:items-end">
          <div className="flex items-center space-x-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col items-end">
              <span className="text-gray-800 dark:text-white font-bold text-sm tracking-tight">{formatTime(currentTime)}</span>
              <span className="text-gray-500 dark:text-gray-400 text-[10px] font-semibold uppercase tracking-widest">{formatDate(currentTime)}</span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5 text-[10px] font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
            {lastSyncTime ? (
              <>
                <svg className="w-3 h-3 text-emerald-500 animate-[spin_4s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>Synced: {formatTime(lastSyncTime)}</span>
              </>
            ) : (
              <span>Syncing...</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Badges & Connectivity */}
      <div className="mt-5 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-center text-[11px]">
        <div className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400 font-medium">
          <span>© {new Date().getFullYear()} OptiConnect GIS.</span>
          <span className="hidden sm:inline">All rights reserved.</span>
        </div>
        
        <div className="flex items-center space-x-2 mt-3 sm:mt-0 flex-wrap justify-center gap-y-2">
          {/* Frontend Badge */}
          <div className="flex items-center space-x-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300 font-semibold tracking-wide">UI: v{versionInfo.version}</span>
          </div>

          {backendConnected && backendHealth ? (
            <>
              {/* Backend Badge */}
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-md border border-emerald-100 dark:border-emerald-800/30 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/40">
                <svg className="h-3 w-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold tracking-wide">API: v{backendHealth.server.version}</span>
              </div>
              
              {/* Latency Badge (New) */}
              {latency !== null && latency !== undefined && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-md border transition-colors ${
                  latency < 100 ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40' :
                  latency < 300 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40' :
                  'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40'
                }`}>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-bold tracking-wide">{latency}ms</span>
                </div>
              )}

              {/* DB Status Badge */}
              <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-md border transition-colors ${
                backendHealth.database.status === 'connected' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30 hover:bg-green-100 dark:hover:bg-green-900/40' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/40'
              }`}>
                <div className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    backendHealth.database.status === 'connected' ? 'bg-green-400 animate-ping' : 'bg-red-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    backendHealth.database.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </div>
                <span className={`font-semibold tracking-wide ${
                  backendHealth.database.status === 'connected' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  DB Connected
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-1.5 px-2 py-1 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 rounded-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-rose-400 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-rose-700 dark:text-rose-300 font-semibold tracking-wide">
                {config.api.enableMocking ? 'Local Mode' : 'Offline'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


