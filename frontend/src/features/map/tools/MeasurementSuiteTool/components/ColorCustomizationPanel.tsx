/**
 * Color Customization Panel
 * Color picker and opacity slider for sector appearance
 */

import React from 'react';

interface ColorCustomizationPanelProps {
  color: string;
  fillOpacity: number;
  onColorChange: (value: string) => void;
  onOpacityChange: (value: number) => void;
}

const ColorCustomizationPanel: React.FC<ColorCustomizationPanelProps> = ({
  color,
  fillOpacity,
  onColorChange,
  onOpacityChange
}) => {
  return (
    <div className="space-y-4">
      {/* Color Picker */}
      <div>
        <label
          htmlFor="sector-color"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Color
        </label>
        <div className="flex gap-2 items-center">
          <input
            id="sector-color"
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-12 h-10 rounded cursor-pointer"
            aria-label="Sector color picker"
          />
          <input
            id="sector-color-text"
            type="text"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            placeholder="#FF5722"
            aria-label="Sector color hex code"
          />
        </div>
      </div>

      {/* Opacity */}
      <div>
        <label
          htmlFor="fill-opacity"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Fill Opacity: {(fillOpacity * 100).toFixed(0)}%
        </label>
        <input
          id="fill-opacity"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={fillOpacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          aria-label={`Fill Opacity: ${(fillOpacity * 100).toFixed(0)} percent`}
        />
      </div>
    </div>
  );
};

export default ColorCustomizationPanel;

