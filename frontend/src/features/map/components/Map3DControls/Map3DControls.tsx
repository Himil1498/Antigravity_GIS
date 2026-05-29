import React, { useState, useEffect } from "react";
import { Map3DControlsProps } from "./types";
import { X, RotateCcw, RotateCw, Plus, Minus, Box, Compass } from "lucide-react";

/**
 * Compact Map 3D Controls Component
 * Provides user controls for manipulating 3D map view
 */
const Map3DControls: React.FC<Map3DControlsProps> = ({
  map,
  controls,
  onClose,
  overlays = [],
}) => {
  const [currentTilt, setCurrentTilt] = useState<number>(
    map?.getTilt() || 67.5,
  );
  const [maxTilt, setMaxTilt] = useState<number>(67.5);
  const [currentHeading, setCurrentHeading] = useState<number>(
    map?.getHeading() || 45,
  );

  // Sync state if map moves externally (e.g. Shift + Drag)
  useEffect(() => {
    if (!map) return;
    const headingListener = map.addListener("heading_changed", () => {
      setCurrentHeading(map.getHeading() || 0);
    });
    const tiltListener = map.addListener("tilt_changed", () => {
      const tilt = map.getTilt() || 0;
      setCurrentTilt(tilt);
      if (tilt > maxTilt) setMaxTilt(tilt);
    });
    const zoomListener = map.addListener("zoom_changed", () => {
      setMaxTilt(67.5); // Reset max tilt on zoom change as constraints may loosen
    });
    return () => {
      google.maps.event.removeListener(headingListener);
      google.maps.event.removeListener(tiltListener);
      google.maps.event.removeListener(zoomListener);
    };
  }, [map, maxTilt]);

  const handleTiltChange = (tilt: number) => {
    setCurrentTilt(tilt);
    if (controls) controls.adjustTilt(tilt);
    else if (map) map.setTilt(tilt);
    
    // If the map clamps the tilt (e.g. to 30), record it as the current max
    setTimeout(() => {
      if (map) {
        const actualTilt = map.getTilt() || 0;
        if (tilt > actualTilt && actualTilt > 0) {
          setMaxTilt(actualTilt);
        }
      }
    }, 50);
  };

  const handleHeadingChange = (heading: number) => {
    let newHeading = heading;
    if (newHeading < 0) newHeading += 360;
    if (newHeading >= 360) newHeading -= 360;
    setCurrentHeading(newHeading);
    if (map) map.setHeading(newHeading);
  };

  const handleTiltKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleTiltChange(currentTilt + 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleTiltChange(currentTilt - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleHeadingChange(currentHeading + 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleHeadingChange(currentHeading - 1);
    }
  };

  const handleClose = () => {
    if (overlays) {
      overlays.forEach((overlay) => {
        if (overlay) {
          if (overlay instanceof google.maps.InfoWindow) {
            overlay.close();
          } else {
            overlay.setMap(null);
          }
        }
      });
    }
    if (controls && controls.reset) {
      controls.reset();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg shadow-xl border border-white/40 dark:border-white/20 rounded-2xl p-1.5 pointer-events-auto flex items-center gap-2 w-max transition-all duration-300">
      
      {/* Tilt Control Wrapper */}
      <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] p-0.5">
        
        {/* Icon */}
        <div className="flex items-center justify-center w-8 h-8 text-purple-600 dark:text-purple-400" title="Map Tilt">
          <Box size={16} strokeWidth={2.5} />
        </div>

        {/* - Button */}
        <button
          onClick={() => handleTiltChange(currentTilt - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50 dark:hover:shadow-black/20"
        >
          <Minus size={14} strokeWidth={2.5} />
        </button>

        {/* Input */}
        <div className="relative flex items-center group w-10">
          <input
            type="number"
            value={Math.round(currentTilt)}
            onChange={(e) => handleTiltChange(Number(e.target.value))}
            onKeyDown={handleTiltKeyDown}
            className="w-full h-7 text-xs font-bold text-center bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 dark:text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="absolute right-0 text-[10px] text-slate-400 pointer-events-none group-focus-within:text-purple-500 font-bold">°</span>
        </div>

        {/* + Button */}
        <button
          onClick={() => handleTiltChange(currentTilt + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50 dark:hover:shadow-black/20"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Rotation Control Wrapper */}
      <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] p-0.5">
        
        {/* Icon */}
        <div className="flex items-center justify-center w-8 h-8 text-blue-600 dark:text-blue-400" title="Map Rotation">
          <Compass size={16} strokeWidth={2.5} />
        </div>

        {/* Left Arrow */}
        <button
          onClick={() => handleHeadingChange(currentHeading - 45)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50 dark:hover:shadow-black/20"
          title="Rotate Left 45°"
        >
          <RotateCcw size={14} strokeWidth={2.5} />
        </button>

        {/* Input */}
        <div className="relative flex items-center group w-11">
          <input
            type="number"
            value={Math.round(currentHeading)}
            onChange={(e) => handleHeadingChange(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            className="w-full h-7 text-xs font-bold text-center bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 dark:text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="absolute right-0 text-[10px] text-slate-400 pointer-events-none group-focus-within:text-blue-500 font-bold">°</span>
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => handleHeadingChange(currentHeading + 45)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50 dark:hover:shadow-black/20"
          title="Rotate Right 45°"
        >
          <RotateCw size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Close Button */}
      <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] p-0.5">
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500 hover:text-white text-slate-400 dark:text-slate-500 transition-all duration-300"
          title="Close 3D View"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default Map3DControls;
