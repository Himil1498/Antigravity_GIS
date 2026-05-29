/**
 * PathTabContent - Enhanced Path Measurement Tab
 * Premium UI with animated stats, segment breakdown, and contextual controls
 */

import React from "react";
import {
  MapPin,
  Mountain,
  Navigation,
  Route,
  Crosshair,
  Eye,
  Save,
} from "lucide-react";
import {
  DistanceUnit,
  DISTANCE_UNITS,
  formatDistanceWithUnit,
} from "../utils/distanceUtils";

interface PathTabContentProps {
  points: Array<{ lat: number; lng: number; label: string }>;
  segments: Array<{ distance: number; from: string; to: string }>;
  totalDistance: number;
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
  formattedDistance: string;
  // Street View
  streetViewEnabled: boolean;
  setStreetViewEnabled: (enabled: boolean) => void;
  setShowStreetViewCoverage: (show: boolean) => void;
  exitStreetView: () => void;
  currentStreetViewPoint: number | null;
  streetViewAvailability: Map<number, boolean>;
  openStreetView: (lat: number, lng: number, index: number) => void;
  // Elevation
  showElevationDrawer: boolean;
  setShowElevationDrawer: (show: boolean) => void;
}

const PathTabContent: React.FC<PathTabContentProps> = ({
  points,
  segments,
  totalDistance,
  distanceUnit,
  setDistanceUnit,
  formattedDistance,
  streetViewEnabled,
  setStreetViewEnabled,
  setShowStreetViewCoverage,
  exitStreetView,
  currentStreetViewPoint,
  streetViewAvailability,
  openStreetView,
  showElevationDrawer,
  setShowElevationDrawer,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Measurement Hero Card */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-sky-950/20 border border-blue-200/60 dark:border-blue-800/40 p-3">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-bl-full" />
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-blue-500/80 dark:text-blue-400/70 mb-1">
            {points.length >= 2 ? "Total Distance" : "Draw a Path"}
          </p>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
            {formattedDistance}
          </h2>
          {segments.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-bold">
                <Route size={10} />
                {segments.length} {segments.length === 1 ? "Segment" : "Segments"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-bold">
                <Crosshair size={10} />
                {points.length} Points
              </span>
            </div>
          )}
          {points.length < 2 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
              <Navigation size={11} className="text-blue-400" />
              Click on the map to place measurement points
            </p>
          )}
        </div>
      </div>

      {/* Segment Breakdown */}
      {segments.length > 0 && (
        <div className="rounded-lg border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
          <div className="px-2.5 py-1.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-700/40">
            <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-slate-500 dark:text-slate-400">
              Segment Details
            </span>
          </div>
          <div className="max-h-24 overflow-y-auto custom-scrollbar">
            {segments.map((seg, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-2.5 py-1 text-xs border-b border-slate-100 dark:border-slate-800/50 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                    <span className="text-white text-[9px] font-extrabold">{i + 1}</span>
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {seg.from} → {seg.to}
                  </span>
                </div>
                <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                  {formatDistanceWithUnit(seg.distance, distanceUnit)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls appear after 2+ points */}
      {points.length >= 2 && (
        <>
          {/* Action Toggles Side-by-Side */}
          <div className="flex gap-2">
            {/* Street View Toggle Button */}
            <button
              onClick={() => {
                const enabled = !streetViewEnabled;
                setStreetViewEnabled(enabled);
                setShowStreetViewCoverage(enabled);
                if (!enabled) exitStreetView();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                streetViewEnabled
                  ? "bg-gradient-to-br from-sky-400 to-blue-500 text-white border-transparent shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <MapPin size={14} className={streetViewEnabled ? "text-white" : "text-blue-500"} />
              Street View
            </button>

            {/* Elevation Toggle Button */}
            <button
              onClick={() => setShowElevationDrawer(!showElevationDrawer)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                showElevationDrawer
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-transparent shadow-md shadow-orange-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <Mountain size={14} className={showElevationDrawer ? "text-white" : "text-orange-500"} />
              Elevation
            </button>
          </div>

          {/* Point Navigation Panel (Appears when Street View is active) */}
          {streetViewEnabled && points.length > 0 && (
            <div className="rounded-lg border border-slate-200/70 dark:border-slate-700/60 overflow-hidden mt-1">
              <div className="px-2.5 py-1.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-700/40">
                <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-slate-500 dark:text-slate-400">
                  Street View Navigation
                </span>
              </div>
              <div className="p-1.5">
                <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar pr-0.5">
                  {points.map((point, index) => {
                    const isAvailable = streetViewAvailability.get(index);
                    const isCurrent = currentStreetViewPoint === index;
                    return (
                      <button
                        key={index}
                        onClick={() => openStreetView(point.lat, point.lng, index)}
                        disabled={isAvailable === false}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          isCurrent
                            ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-sm"
                            : isAvailable === false
                            ? "text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/20"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300 border border-transparent"
                        }`}
                      >
                        <span className="font-bold">Point {point.label}</span>
                        <div className="flex items-center gap-1.5">
                          {isAvailable !== undefined && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-red-400"}`}
                            />
                          )}
                          <Eye size={12} className={isCurrent ? "text-blue-500" : "text-slate-400"} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Distance Unit Selector */}
      <div className="rounded-lg border border-slate-200/70 dark:border-slate-700/60 px-2.5 py-2">
        <label className="text-[10px] uppercase tracking-[0.12em] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
          Distance Unit
        </label>
        <select
          value={distanceUnit}
          onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}
          className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-slate-700 dark:text-slate-200"
        >
          {DISTANCE_UNITS.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PathTabContent;
