import React from "react";
import { formatDistance } from "../../../../utils/elevation/index";

// ============================================================================
// TYPES
// ============================================================================

interface ModalHeaderProps {
  measurementName: string;
  totalDistance: number;
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ModalHeader Component
 * Header section with title, distance, and close button
 */
const ModalHeader: React.FC<ModalHeaderProps> = ({
  measurementName,
  totalDistance,
  onClose
}) => (
  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
        <svg
          className="w-7 h-7 mr-3 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
        {measurementName}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Elevation Profile - {formatDistance(totalDistance)}
      </p>
    </div>
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
      aria-label="Close elevation graph modal"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
);

export default ModalHeader;

