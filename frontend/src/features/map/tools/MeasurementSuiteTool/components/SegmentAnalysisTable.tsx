import React from "react";
import { formatDistance as formatDistanceUtil, getGradeColor } from "../../../../../utils/elevation/index";
import type { SegmentElevation } from "../../../../../types/gisToolTypes/index";

interface SegmentAnalysisTableProps {
  segmentElevationStats: SegmentElevation[];
}

const SegmentAnalysisTable: React.FC<SegmentAnalysisTableProps> = ({
  segmentElevationStats
}) => {
  return (
    <div className="mt-3">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
        <svg
          className="w-4 h-4 mr-2 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Segment Analysis
      </h4>
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                Segment
              </th>
              <th className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                Distance
              </th>
              <th className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                Elev Δ
              </th>
              <th className="px-3 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {segmentElevationStats.map(
              (segment: SegmentElevation, index: number) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                    {segment.from} → {segment.to}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">
                    {formatDistanceUtil(segment.distance)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-semibold ${
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
                    {Math.abs(
                      segment.elevationChange
                    ).toFixed(1)}
                    m
                  </td>
                  <td
                    className="px-3 py-2 text-right font-bold"
                    style={{
                      color: getGradeColor(segment.grade),
                    }}
                  >
                    {segment.grade.toFixed(1)}%
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SegmentAnalysisTable;

