/**
 * AreaTabContent - Enhanced Area Calculation Tab
 * Premium UI with gradient stats, drawing controls, and vertex management
 */

import React from "react";
import {
  Hexagon,
  CheckCircle2,
  Palette,
  Layers,
  Navigation,
  Crosshair,
} from "lucide-react";
import {
  DistanceUnit,
  formatDistanceWithUnit,
} from "../utils/distanceUtils";
import { AreaUnit, AREA_UNITS, formatArea } from "../utils/areaUtils";

interface AreaTabContentProps {
  vertices: Array<{ lat: number; lng: number }>;
  area: number;
  perimeter: number;
  isDrawing: boolean;
  color: string;
  fillOpacity: number;
  setColor: (color: string) => void;
  setFillOpacity: (opacity: number) => void;
  completeDrawing: () => void;
  formattedArea: string;
  areaUnit: AreaUnit;
  setAreaUnit: (unit: AreaUnit) => void;
  distanceUnit: DistanceUnit;
}

const AreaTabContent: React.FC<AreaTabContentProps> = ({
  vertices,
  area,
  perimeter,
  isDrawing,
  color,
  fillOpacity,
  setColor,
  setFillOpacity,
  completeDrawing,
  formattedArea,
  areaUnit,
  setAreaUnit,
  distanceUnit,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Measurement Hero Card */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 dark:from-purple-950/40 dark:via-fuchsia-950/30 dark:to-violet-950/20 border border-purple-200/60 dark:border-purple-800/40 p-3">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-200/30 to-transparent rounded-bl-full" />
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-purple-500/80 dark:text-purple-400/70 mb-1">
            {vertices.length >= 3 ? "Total Area" : "Draw a Polygon"}
          </p>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
            {formattedArea}
          </h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {perimeter > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-bold">
                Perimeter: {formatDistanceWithUnit(perimeter, distanceUnit)}
              </span>
            )}
            {vertices.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300 rounded-full text-[10px] font-bold">
                <Crosshair size={10} />
                {vertices.length} Vertices
              </span>
            )}
          </div>
          {vertices.length < 3 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
              <Navigation size={11} className="text-purple-400" />
              Click on the map to place polygon vertices
            </p>
          )}
        </div>
      </div>

      {/* Style Controls */}
      {vertices.length > 0 && (
        <div className="rounded-lg border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
          <div className="px-2.5 py-1.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-700/40">
            <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Palette size={11} />
              Appearance
            </span>
          </div>
          <div className="p-2.5 space-y-2.5">
            {/* Color Picker */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                Fill Color
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase">{color}</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-2 border-slate-200 dark:border-slate-600 shadow-sm hover:scale-110 transition-transform"
                />
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers size={12} />
                  Opacity
                </label>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded-md">
                  {Math.round(fillOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={fillOpacity}
                onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-1.5"
              />
            </div>
          </div>
        </div>
      )}

      {/* Area Unit Selector */}
      <div className="rounded-lg border border-slate-200/70 dark:border-slate-700/60 px-2.5 py-2">
        <label className="text-[10px] uppercase tracking-[0.12em] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
          Area Unit
        </label>
        <select
          value={areaUnit}
          onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
          className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all text-slate-700 dark:text-slate-200"
        >
          {AREA_UNITS.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
      </div>

      {/* Vertices List */}
      {vertices.length > 0 && (
        <div className="rounded-lg border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
          <div className="px-2.5 py-1.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-700/40 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Hexagon size={11} />
              Vertices
            </span>
            <span className="text-[10px] font-bold text-purple-500 dark:text-purple-400">
              {vertices.length} pts
            </span>
          </div>
          <div className="max-h-24 overflow-y-auto custom-scrollbar">
            {vertices.map((v, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-2.5 py-1 text-xs border-b border-slate-100 dark:border-slate-800/50 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-400 to-fuchsia-600 flex items-center justify-center shadow-sm">
                    <span className="text-white text-[9px] font-extrabold">{i + 1}</span>
                  </div>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    V{i + 1}
                  </span>
                </div>
                <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
                  {v.lat.toFixed(5)}, {v.lng.toFixed(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaTabContent;
