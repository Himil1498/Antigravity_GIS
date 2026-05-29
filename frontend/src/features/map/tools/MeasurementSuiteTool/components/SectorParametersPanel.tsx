/**
 * Sector Parameters Panel
 * Controls for radius, azimuth, and beamwidth with preset buttons
 */

import React from 'react';
import { PRESET_RADII, PRESET_BEAMWIDTHS } from '../constants/sectorConstants';
import { formatDistance, getCardinalDirection } from '../utils/sectorUtils';

interface SectorParametersPanelProps {
  radius: number;
  azimuth: number;
  beamwidth: number;
  onRadiusChange: (value: number) => void;
  onAzimuthChange: (value: number) => void;
  onBeamwidthChange: (value: number) => void;
}

const SectorParametersPanel: React.FC<SectorParametersPanelProps> = ({
  radius,
  azimuth,
  beamwidth,
  onRadiusChange,
  onAzimuthChange,
  onBeamwidthChange
}) => {
  return (
    <div className="space-y-4">
      {/* Coverage Radius */}
      <div>
        <label
          htmlFor="coverage-radius"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Coverage Radius: {formatDistance(radius)}
        </label>
        <input
          id="coverage-radius"
          type="range"
          min="100"
          max="20000"
          step="100"
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          aria-label={`Coverage Radius: ${formatDistance(radius)}`}
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {PRESET_RADII.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onRadiusChange(preset.value)}
              className={`px-2 py-1 text-xs rounded ${
                radius === preset.value
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Azimuth (Direction) */}
      <div>
        <label
          htmlFor="azimuth-direction"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Azimuth (Direction): {azimuth}° {getCardinalDirection(azimuth)}
        </label>
        <input
          id="azimuth-direction"
          type="range"
          min="0"
          max="360"
          step="1"
          value={azimuth}
          onChange={(e) => onAzimuthChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          aria-label={`Azimuth Direction: ${azimuth} degrees ${getCardinalDirection(azimuth)}`}
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>N (0°)</span>
          <span>E (90°)</span>
          <span>S (180°)</span>
          <span>W (270°)</span>
        </div>
      </div>

      {/* Beamwidth */}
      <div>
        <label
          htmlFor="beamwidth"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Beamwidth: {beamwidth}°
        </label>
        <input
          id="beamwidth"
          type="range"
          min="10"
          max="360"
          step="5"
          value={beamwidth}
          onChange={(e) => onBeamwidthChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          aria-label={`Beamwidth: ${beamwidth} degrees`}
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {PRESET_BEAMWIDTHS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onBeamwidthChange(preset.value)}
              className={`px-2 py-1 text-xs rounded ${
                beamwidth === preset.value
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectorParametersPanel;

