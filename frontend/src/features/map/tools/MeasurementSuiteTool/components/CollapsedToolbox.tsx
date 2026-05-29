/**
 * Collapsed Toolbox Component
 * Minimized view - left-anchored glassmorphic design
 */

import React from 'react';
import { formatDistance } from '../utils/sectorUtils';
import type { SectorCenter } from '../types/sectorTypes';
import { Radio, Trash2, ChevronDown, X } from 'lucide-react';

interface CollapsedToolboxProps {
  center: SectorCenter | null;
  radius: number;
  azimuth: number;
  beamwidth: number;
  onExpand: () => void;
  onClose?: () => void;
  onClear: () => void;
  containerStyle?: React.CSSProperties;
}

const CollapsedToolbox: React.FC<CollapsedToolboxProps> = ({
  center,
  radius,
  azimuth,
  beamwidth,
  onExpand,
  onClose,
  onClear,
  containerStyle
}) => {
  return (
    <div 
      className="absolute top-2 sm:top-3 left-4 w-[340px] h-[56px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[24px] shadow-lg border border-gray-200/50 dark:border-white/10 z-40 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
      style={containerStyle}
    >
      <div className="flex items-center justify-between h-full px-5">
        {/* Left: Icon + Title + Stats */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-b from-rose-500 to-rose-600 rounded-[10px] flex items-center justify-center shadow-[0_4px_12px_rgba(225,29,72,0.4)] border border-rose-400/30">
            <Radio size={16} className="text-white" />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-[14px] font-bold text-gray-900 dark:text-white leading-none mb-0.5 tracking-tight">Sector RF</span>
            {center && (
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-none truncate">
                {formatDistance(radius)} • Az: {azimuth}° • Bw: {beamwidth}°
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            disabled={!center}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Clear Sector"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={onExpand}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
            title="Expand Toolbox"
          >
            <ChevronDown size={16} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-300 group"
              title="Close"
            >
              <X size={16} className="transition-transform group-hover:rotate-90 group-hover:scale-110" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollapsedToolbox;
