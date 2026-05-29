import React, { useState } from 'react';
import { useLogo } from '../../contexts/LogoContext';
import { showToast } from '../../utils/toastUtils';

/**
 * LogoSwitcherHUD - A specialized development tool for the "Logo Laboratory".
 * Allows real-time auditioning of 32 brand assets with transparency toggling.
 * Only visible in development environments.
 */

const LogoSwitcherHUD: React.FC = () => {
  const { logoIndex, totalLogos, setLogoIndex, isTransparent, setIsTransparent, logoPath, nextLogo, prevLogo } = useLogo();
  const [isMinimized, setIsMinimized] = useState(true);

  // Avoid rendering in production.
  // process.env.NODE_ENV is set by react-scripts during the build:prod command in deploy_master.ps1
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 left-4 z-[9999] bg-blue-600 text-white p-2 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-transform"
        onClick={() => setIsMinimized(false)}
        title="Open Logo Laboratory"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-gray-700 overflow-hidden font-sans animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-white font-bold text-sm tracking-tight">Logo Laboratory</h3>
        </div>
        <button 
          onClick={() => setIsMinimized(true)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Preview Area */}
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-6 flex flex-col items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 relative overflow-hidden group">
          <div className="absolute top-2 left-2 flex space-x-1 opacity-100 transition-opacity">
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${logoPath.includes('Transparent_Dark') ? 'bg-indigo-600 text-white' : 'bg-amber-400 text-black'}`}>
              {logoPath.includes('Transparent_Dark') ? 'Dark Mode Asset' : 'Light Mode Asset'}
            </span>
          </div>
          <img 
            src={logoPath} 
            alt="Current Logo" 
            className="max-h-24 w-auto object-contain drop-shadow-lg transition-all duration-300 group-hover:scale-110"
          />
          <div className="mt-3 text-[10px] font-mono text-gray-500 dark:text-gray-400 truncate w-full text-center">
            {logoPath}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between space-x-2">
          <button 
            onClick={prevLogo}
            className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2.5 rounded-xl transition-colors text-gray-700 dark:text-gray-200"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm min-w-[60px] text-center border border-blue-100 dark:border-blue-800">
            {logoIndex} / {totalLogos}
          </div>

          <button 
            onClick={nextLogo}
            className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2.5 rounded-xl transition-colors text-gray-700 dark:text-gray-200"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Settings */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
              Remove Background
            </span>
            <div className="relative inline-flex items-center">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isTransparent}
                onChange={(e) => setIsTransparent(e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>

          <button 
            onClick={() => {
              navigator.clipboard.writeText(logoPath);
              showToast.success('Copied path: ' + logoPath);
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <span>Copy Asset Path</span>
          </button>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-2 text-[9px] text-center text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700">
        Changes persist across reloads • DEV MODE ONLY
      </div>
    </div>
  );
};

export default LogoSwitcherHUD;
