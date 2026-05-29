/**
 * Expanded Toolbox Component
 * Full control panel with all polygon drawing options
 */

import React from "react";
import { formatArea, formatPerimeter } from "../utils";
import { ExpandedToolboxProps } from "./ExpandedToolboxTypes";

const ExpandedToolbox: React.FC<ExpandedToolboxProps> = ({
  vertices,
  area,
  perimeter,
  color,
  fillOpacity,
  isDrawing,
  saving,
  onColorChange,
  onOpacityChange,
  onUndoLastVertex,
  onCompleteDrawing,
  onClearAll,
  onStartDrawing,
  onSave,
  onCollapse,
  onClose,
  containerStyle
}) => {
  return (
    <div 
      className="fixed top-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 max-w-sm z-40 max-h-[90vh] overflow-y-auto transition-all duration-300 ease-in-out"
      style={containerStyle}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 flex items-center">
          <span className="text-xl mr-2">⬡</span>
          Polygon Drawing
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={onCollapse}
            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-all"
            title="Collapse to top"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500 rounded transition-all duration-300 group cursor-pointer"
              title="Close"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:rotate-90 group-hover:scale-110"
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
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          {isDrawing
            ? "Click on the map to add vertices. Add at least 3 vertices to create a polygon."
            : "Drawing complete. You can now save this polygon."}
        </p>
      </div>

      {/* Geometry Display */}
      {vertices.length >= 3 && (
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
              Perimeter
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatPerimeter(perimeter)}
            </div>
          </div>
        </div>
      )}

      {/* Vertices List */}
      {vertices.length > 0 && (
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vertices ({vertices.length})
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {vertices.map((vertex, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Point {index + 1}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {vertex.lat.toFixed(6)}, {vertex.lng.toFixed(6)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Picker */}
      <div className="mb-2">
        <label
          htmlFor="polygon-color-picker"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Polygon Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            id="polygon-color-picker"
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
            aria-label="Select polygon color"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            aria-label="Polygon color hex code"
            placeholder="#FF0000"
          />
        </div>
      </div>

      {/* Opacity Slider */}
      <div className="mb-2">
        <label
          htmlFor="polygon-opacity-slider"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Fill Opacity: {(fillOpacity * 100).toFixed(0)}%
        </label>
        <input
          id="polygon-opacity-slider"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={fillOpacity}
          onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          className="w-full"
          aria-label="Adjust fill opacity"
        />
      </div>

      {/* Action Buttons - 3 Column Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
        {isDrawing ? (
          <>
            <button
              onClick={onUndoLastVertex}
              disabled={vertices.length === 0}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Undo
            </button>
            <button
              onClick={onCompleteDrawing}
              disabled={vertices.length < 3}
              className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete
            </button>
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Clear All
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onStartDrawing}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Edit
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              Clear All
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpandedToolbox;

