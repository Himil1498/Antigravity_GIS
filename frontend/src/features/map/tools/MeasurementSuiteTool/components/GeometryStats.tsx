import React from "react";

interface GeometryStatsProps {
  area: number;
  perimeter: number;
  formatArea: (sqMeters: number) => string;
  formatDistance: (meters: number) => string;
}

const GeometryStats: React.FC<GeometryStatsProps> = ({
  area,
  perimeter,
  formatArea,
  formatDistance,
}) => {
  return (
    <div className="mb-2 space-y-1.5">
      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
          Area
        </div>
        <div className="text-lg font-bold text-green-600 dark:text-green-400">
          {formatArea(area)}
        </div>
      </div>
      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
          Perimeter (Circumference)
        </div>
        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
          {formatDistance(perimeter)}
        </div>
      </div>
    </div>
  );
};

export default GeometryStats;

