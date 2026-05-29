import React, { useState } from "react";
import { formatDistance, getGradeColor } from "../../../../utils/elevation/index";
import type { SegmentElevation } from "../../../../types/gisToolTypes/index";

// ============================================================================
// TYPES
// ============================================================================

interface SegmentStatisticsProps {
  segmentStats: SegmentElevation[];
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SegmentStatistics Component
 * Displays collapsible segment analysis table
 */
const SegmentStatistics: React.FC<SegmentStatisticsProps> = ({ segmentStats }) => {
  const [showSegments, setShowSegments] = useState<boolean>(false);

  if (segmentStats.length === 0) return null;

  return (
    <div className="px-6 pb-4">
      <button
        onClick={() => setShowSegments(!showSegments)}
        className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
        aria-label={showSegments ? "Hide segment analysis" : "Show segment analysis"}
      >
        <span className="font-semibold text-gray-900 dark:text-white">
          📊 Segment Analysis ({segmentStats.length} segments)
        </span>
        <svg
          className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
            showSegments ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showSegments && (
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Segment
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                  Distance
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                  Elevation Δ
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {segmentStats.map((segment, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                    {segment.from} → {segment.to}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    {formatDistance(segment.distance)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-bold ${
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
                    className="px-4 py-3 text-right font-bold"
                    style={{ color: getGradeColor(segment.grade) }}
                  >
                    {segment.grade.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SegmentStatistics;



