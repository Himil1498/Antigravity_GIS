import React from "react";

interface BearingDisplayProps {
  bearing: number;
}

const getCardinalDirection = (degrees: number): string => {
  if (degrees >= 337.5 || degrees < 22.5) return "N";
  if (degrees >= 22.5 && degrees < 67.5) return "NE";
  if (degrees >= 67.5 && degrees < 112.5) return "E";
  if (degrees >= 112.5 && degrees < 157.5) return "SE";
  if (degrees >= 157.5 && degrees < 202.5) return "S";
  if (degrees >= 202.5 && degrees < 247.5) return "SW";
  if (degrees >= 247.5 && degrees < 292.5) return "W";
  return "NW";
};

const BearingDisplay: React.FC<BearingDisplayProps> = ({ bearing }) => {
  const reverseBearing = (bearing + 180) % 360;

  return (
    <div className="grid grid-cols-4 gap-2 mt-2">
      <div className="p-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg border border-orange-200 dark:border-orange-700">
        <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
          📐 Bearing (A→B)
        </div>
        <div className="text-base font-bold text-orange-700 dark:text-orange-300">
          {bearing.toFixed(1)}°
        </div>
        <div className="text-xs text-orange-500 dark:text-orange-400 mt-0.5">
          {getCardinalDirection(bearing)}
        </div>
      </div>
      <div className="p-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg border border-orange-200 dark:border-orange-700">
        <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
          📐 Reverse (B→A)
        </div>
        <div className="text-base font-bold text-orange-700 dark:text-orange-300">
          {reverseBearing.toFixed(1)}°
        </div>
        <div className="text-xs text-orange-500 dark:text-orange-400 mt-0.5">
          {getCardinalDirection(reverseBearing)}
        </div>
      </div>
    </div>
  );
};

export default BearingDisplay;

