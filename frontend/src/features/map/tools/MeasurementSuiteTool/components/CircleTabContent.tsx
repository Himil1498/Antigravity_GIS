import React from "react";
import { Circle, MapPin, Hash, Ruler, MousePointer2, Palette, Layers, Crosshair, Trash2 } from "lucide-react";

interface CircleTabContentProps {
  isPlacingCenter: boolean;
  setIsPlacingCenter: (isPlacing: boolean) => void;
  center: { lat: number; lng: number } | null;
  circles: { id: string; lat: number; lng: number; radius: number; color: string; fillOpacity: number }[];
  activeCircleIndex: number | null;
  setActiveCircleIndex: (index: number | null) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  formatDistance: (meters: number) => string;
  area: number;
  perimeter: number;
  formatArea: (sqMeters: number) => string;
  color: string;
  onColorChange: (color: string) => void;
  fillOpacity: number;
  onFillOpacityChange: (opacity: number) => void;
  onDeleteCircle: (index: number) => void;
}

const CircleTabContent: React.FC<CircleTabContentProps> = ({
  isPlacingCenter,
  setIsPlacingCenter,
  center,
  circles,
  activeCircleIndex,
  setActiveCircleIndex,
  radius,
  onRadiusChange,
  formatDistance,
  area,
  perimeter,
  formatArea,
  color,
  onColorChange,
  fillOpacity,
  onFillOpacityChange,
  onDeleteCircle,
}) => {
  const isMulti = circles.length > 1;
  const activeCircle = activeCircleIndex !== null ? circles[activeCircleIndex] : null;

  // Use values from active circle if available, otherwise fallback to global
  const currentRadius = activeCircle ? activeCircle.radius : radius;
  const currentColor = activeCircle ? activeCircle.color : color;
  const currentOpacity = activeCircle ? activeCircle.fillOpacity : fillOpacity;

  return (
    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Measurement Hero Card */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-cyan-950/20 border border-emerald-200/60 dark:border-emerald-800/40 p-3">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-200/30 to-transparent rounded-bl-full" />
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-emerald-500/80 dark:text-emerald-400/70 mb-1">
            {activeCircle ? `Editing Circle ${activeCircleIndex! + 1}` : circles.length > 0 ? "Radius Analysis" : "Draw a Circle"}
          </p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
              {circles.length > 0 ? formatDistance(currentRadius) : "0.00 m"}
            </h2>
            {isMulti && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                x{circles.length} Circles
              </span>
            )}
          </div>
          
          {circles.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-bold">
                <Layers size={10} />
                Area: {formatArea(area)}
              </span>
            </div>
          )}

          {circles.length === 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
              <MousePointer2 size={11} className="text-emerald-400" />
              Click on the map to set the first circle
            </p>
          )}
        </div>
      </div>

      {/* Circle Selection List - New Feature */}
      {(circles.length > 0) && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1.5">
              <Hash size={12} className="text-emerald-500" /> Placed Circles
            </span>
          </div>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto p-1 custom-scrollbar">
            {circles.map((c, i) => (
              <div key={c.id} className="flex items-center gap-1 group">
                <button
                  onClick={() => setActiveCircleIndex(i)}
                  className={`flex-1 px-2 py-2 rounded-md text-[10px] font-bold border transition-all flex items-center gap-2 ${
                    activeCircleIndex === i
                      ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                      : "bg-white dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" 
                    style={{ backgroundColor: c.color }} 
                  />
                  <span className="flex-1 text-left">Circle {i + 1} ({formatDistance(c.radius)})</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCircle(i);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-all"
                  title="Delete Circle"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {isMulti && (
              <button
                onClick={() => setActiveCircleIndex(null)}
                className={`w-full px-2 py-1.5 rounded-md text-[10px] font-bold border transition-all ${
                  activeCircleIndex === null
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                    : "bg-white dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                }`}
              >
                Reset Selection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Placement Toggle */}
      {circles.length > 0 && (
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1.5">
            <Crosshair size={12} className="text-emerald-500" /> Circle Placement
          </span>
          <button 
            onClick={() => setIsPlacingCenter(!isPlacingCenter)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all ${
              isPlacingCenter 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700"
            }`}
          >
            {isPlacingCenter ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Tap Map to Place
              </>
            ) : (
              <>
                <MapPin size={11} />
                + Add Another Circle
              </>
            )}
          </button>
        </div>
      )}

      {circles.length > 0 && (
        <>
          {/* Radius Control Slider */}
          <div className="flex flex-col gap-2 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Ruler size={12} className="text-emerald-500" /> 
                {activeCircle ? "Individual Radius" : "Default Radius"}
              </label>
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                {formatDistance(currentRadius)}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10000"
              value={currentRadius}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Appearance Section */}
          <div className="rounded-lg border border-slate-200/70 dark:border-slate-700/60 overflow-hidden shadow-sm">
            <div className="px-2.5 py-1.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-700/40">
              <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Palette size={11} /> 
                {activeCircle ? "Individual Styling" : "Default Styling"}
              </span>
            </div>
            <div className="p-2.5 space-y-3 bg-white dark:bg-slate-900/20">
              {/* Color Picker */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Fill Color</span>
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-md border border-slate-200 dark:border-slate-700">
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-5 h-5 border-0 p-0 bg-transparent rounded cursor-pointer overflow-hidden"
                  />
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500">{currentColor}</span>
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Fill Opacity</span>
                  <span className="text-[11px] font-bold text-slate-500">{Math.round(currentOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentOpacity}
                  onChange={(e) => onFillOpacityChange(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CircleTabContent;
