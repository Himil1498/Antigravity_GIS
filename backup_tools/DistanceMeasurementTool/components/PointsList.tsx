import React from "react";
import { Point } from "../types/distanceTypes";

interface PointsListProps {
  points: Point[];
  streetViewEnabled: boolean;
  streetViewAvailability: Map<number, boolean>;
  currentStreetViewPoint: number | null;
  openStreetView: (lat: number, lng: number, pointIndex: number) => void;
}

const PointsList: React.FC<PointsListProps> = ({
  points,
  streetViewEnabled,
  streetViewAvailability,
  currentStreetViewPoint,
  openStreetView
}) => {
  if (points.length === 0) return null;

  return (
    <div className="mb-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Points ({points.length})
      </h4>
      <div className="max-h-32 overflow-y-auto space-y-1">
        {points.map((point, index) => {
          const isAvailable = streetViewAvailability.get(index);
          const isCurrent = currentStreetViewPoint === index;
          return (
            <div
              key={index}
              className={`flex items-center justify-between text-xs p-2 rounded transition-colors ${
                isCurrent
                  ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500"
                  : "bg-gray-50 dark:bg-gray-900"
              }`}
            >
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Point {point.label}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
              </span>
              {streetViewEnabled && (
                <div className="flex items-center space-x-1">
                  {isAvailable !== undefined && (
                    <span
                      title={
                        isAvailable
                          ? "Street View Available"
                          : "Street View Unavailable"
                      }
                      className={`w-2 h-2 rounded-full ${
                        isAvailable ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  )}
                  <button
                    onClick={() =>
                      openStreetView(point.lat, point.lng, index)
                    }
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 p-1 disabled:opacity-50"
                    title="Open Street View"
                    disabled={isAvailable === false}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PointsList;

