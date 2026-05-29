import React from "react";
import { Radio, MapPin, Navigation, Share2, Ruler, MousePointer2, Palette } from "lucide-react";
import { PRESET_RADII, PRESET_BEAMWIDTHS } from "../constants/sectorConstants";
import { formatDistance, formatArea, getCardinalDirection } from "../utils/sectorUtils";

interface SectorTabContentProps {
  isPlacingCenter: boolean;
  center: { lat: number; lng: number } | null;
  radius: number;
  azimuth: number;
  beamwidth: number;
  onRadiusChange: (val: number) => void;
  onAzimuthChange: (val: number) => void;
  onBeamwidthChange: (val: number) => void;
  area: number;
  arcLength: number;
  color: string;
  fillOpacity: number;
  onColorChange: (val: string) => void;
  onOpacityChange: (val: number) => void;
}

const SectorTabContent: React.FC<SectorTabContentProps> = ({
  isPlacingCenter,
  center,
  radius,
  azimuth,
  beamwidth,
  onRadiusChange,
  onAzimuthChange,
  onBeamwidthChange,
  area,
  arcLength,
  color,
  fillOpacity,
  onColorChange,
  onOpacityChange,
}) => {
  return (
    <div className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Measurement Hero Card - Matched to Path/Area Tab Style */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 dark:from-rose-950/40 dark:via-red-950/30 dark:to-orange-950/20 border border-rose-200/60 dark:border-rose-800/40 p-3">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-200/30 to-transparent rounded-bl-full" />
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-rose-500/80 dark:text-rose-400/70 mb-1">
            {center ? "Sector RF Coverage" : "Place Sector Tower"}
          </p>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
            {center ? formatArea(area) : "0.00 sq km"}
          </h2>
          
          {center && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-full text-[10px] font-bold">
                <Share2 size={10} />
                Beam Arc: {formatDistance(arcLength)}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-[10px] font-bold">
                <Navigation size={10} />
                {azimuth}° {getCardinalDirection(azimuth)}
              </span>
            </div>
          )}

          {!center && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
              <Radio size={11} className="text-rose-400" />
              Click on the map to set tower location
            </p>
          )}
        </div>
      </div>

      {center && (
        <>
          {/* Tower Info */}
          <div className="px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-rose-500" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Tower Site:</span>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
                </span>
              </div>
            </div>
          </div>

          {/* Parameters Panel */}
          <div className="space-y-3 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60 bg-white dark:bg-slate-800/40">
            {/* Radius */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Ruler size={11} className="text-rose-500" /> Coverage Radius
                </span>
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400">{formatDistance(radius)}</span>
              </div>
              <input
                type="range"
                min="100"
                max="20000"
                step="100"
                value={radius}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex gap-1 mt-0.5 overflow-x-auto pb-1 custom-scrollbar text-nowrap">
                {PRESET_RADII.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => onRadiusChange(preset.value)}
                    className={`shrink-0 px-1.5 py-0.5 text-[8px] font-bold rounded transition-all ${
                      radius === preset.value
                        ? "bg-rose-500 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Azimuth */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Navigation size={11} className="text-rose-500" /> Azimuth (Direction)
                </span>
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400">{azimuth}° {getCardinalDirection(azimuth)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={azimuth}
                onChange={(e) => onAzimuthChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Beamwidth */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Share2 size={11} className="text-rose-500" /> Beamwidth
                </span>
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400">{beamwidth}°</span>
              </div>
              <input
                type="range"
                min="10"
                max="360"
                step="5"
                value={beamwidth}
                onChange={(e) => onBeamwidthChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex gap-1 mt-0.5 overflow-x-auto pb-1 custom-scrollbar text-nowrap">
                {PRESET_BEAMWIDTHS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => onBeamwidthChange(preset.value)}
                    className={`shrink-0 px-1.5 py-0.5 text-[8px] font-bold rounded transition-all ${
                      beamwidth === preset.value
                        ? "bg-rose-500 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="rounded-lg border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
            <div className="px-2.5 py-1.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-700/40">
              <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Palette size={11} /> Appearance
              </span>
            </div>
            <div className="p-2.5 space-y-3 bg-white dark:bg-slate-900/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Fill Color</span>
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-0.5 rounded border border-slate-200 dark:border-slate-700">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-5 h-5 border-0 p-0 bg-transparent rounded cursor-pointer overflow-hidden"
                  />
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-500">{color}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Fill Opacity</span>
                  <span className="text-[11px] font-bold text-slate-500">{Math.round(fillOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={fillOpacity}
                  onChange={(e) => onOpacityChange(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SectorTabContent;
