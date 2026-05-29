import React from "react";
import { Segment, Point, ElevationDataPoint } from "../types/distanceTypes";
import { SegmentElevation } from "../../../../../types/gisToolTypes/index";
import { getGradeColor } from "../../../../../utils/elevation/index";
import { formatDistance } from "../utils/distanceUtils";

interface SegmentAnalysisTableProps {
  segments: Segment[];
  segmentElevationStats: SegmentElevation[];
}

const SegmentAnalysisTable: React.FC<SegmentAnalysisTableProps> = ({
  segments,
  segmentElevationStats
}) => {
  // Enhanced Segments Table with Elevation Data
  if (segmentElevationStats.length > 0) {
    return (
      <div className="mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Segment Analysis
        </h4>
        <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-2 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Segment
                </th>
                <th className="px-2 py-2 text-right font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Distance
                </th>
                <th className="px-2 py-2 text-right font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Elev Δ
                </th>
                <th className="px-2 py-2 text-right font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {segmentElevationStats.map((segment, index) => (
                <tr key={index}>
                  <td className="px-2 py-2 font-semibold text-gray-900 dark:text-white">
                    {segment.from} → {segment.to}
                  </td>
                  <td className="px-2 py-2 text-right text-gray-900 dark:text-white">
                    {formatDistance(segment.distance)}
                  </td>
                  <td
                    className={`px-2 py-2 text-right font-bold ${
                      segment.elevationChange > 0
                        ? "text-green-600 dark:text-green-400"
                        : segment.elevationChange < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {segment.elevationChange > 0
                      ? "↑"
                      : segment.elevationChange < 0
                      ? "↓"
                      : "→"}
                    {Math.abs(segment.elevationChange).toFixed(1)}m
                  </td>
                  <td
                    className={`px-2 py-2 text-right font-bold`}
                    style={{ color: getGradeColor(segment.grade) }}
                  >
                    {segment.grade.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Basic Segments Table (no elevation data)
  if (segments.length > 0) {
    return (
      <div className="mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Segments
        </h4>
        <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  From
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  To
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Distance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {segments.map((segment, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                    {segment.from}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                    {segment.to}
                  </td>
                  <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-white">
                    {formatDistance(segment.distance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};

export default SegmentAnalysisTable;

