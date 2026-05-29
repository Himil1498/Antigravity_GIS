import React from "react";

// ============================================================================
// TYPES
// ============================================================================

interface ActionButtonsProps {
  hasSegments: boolean;
  hasLOSData: boolean;
  hasMultiplePoints: boolean;
  onExportElevation: () => void;
  onExportSegments: () => void;
  onView3D: () => void;
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ActionButtons Component
 * Footer action buttons for export and 3D view
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  hasSegments,
  hasLOSData,
  hasMultiplePoints,
  onExportElevation,
  onExportSegments,
  onView3D,
  onClose
}) => (
  <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
    <div className="flex space-x-2">
      <button
        onClick={onExportElevation}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all flex items-center"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export Elevation CSV
      </button>

      {hasSegments && (
        <button
          onClick={onExportSegments}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export Segments CSV
        </button>
      )}

      {hasLOSData && hasMultiplePoints && (
        <button
          onClick={onView3D}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View in 3D Map
        </button>
      )}
    </div>

    <button
      onClick={onClose}
      className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
    >
      Close
    </button>
  </div>
);

export default ActionButtons;

