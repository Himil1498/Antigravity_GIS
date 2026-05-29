/**
 * Map Loading States Component
 *
 * Displays error, loading, and overlay screens for the map.
 * Extracted from MapPage.tsx (Lines 2314-2452)
 */

import React from "react";

/**
 * Props for MapErrorScreen component
 */
interface MapErrorScreenProps {
  error: string | Error;
}

/**
 * Displays error screen when Google Maps fails to load
 */
export const MapErrorScreen: React.FC<MapErrorScreenProps> = ({ error }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 flex items-center justify-center bg-red-100 rounded-lg mb-4">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Map Loading Error
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {typeof error === "string" ? error : error.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Retry Loading
        </button>
      </div>
    </div>
  );
};

/**
 * Displays loading screen while Google Maps API is loading
 */
export const MapLoadingScreen: React.FC = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Loading Maps
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please wait while we load the Google Maps API...
        </p>
      </div>
    </div>
  );
};

/**
 * Props for MapLoadingOverlay component
 */
interface MapLoadingOverlayProps {
  isLoading: boolean;
}

/**
 * Displays loading overlay while map is initializing
 */
export const MapLoadingOverlay: React.FC<MapLoadingOverlayProps> = ({
  isLoading,
}) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Initializing map...
        </p>
      </div>
    </div>
  );
};

