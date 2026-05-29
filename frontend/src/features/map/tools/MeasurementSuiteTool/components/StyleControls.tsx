import React from "react";

interface StyleControlsProps {
  color: string;
  onColorChange: (color: string) => void;
  fillOpacity: number;
  onFillOpacityChange: (opacity: number) => void;
}

const StyleControls: React.FC<StyleControlsProps> = ({
  color,
  onColorChange,
  fillOpacity,
  onFillOpacityChange,
}) => {
  return (
    <>
      <div className="mb-4">
        <label
          htmlFor="circle-color-picker"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Circle Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            id="circle-color-picker"
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
            aria-label="Circle color picker"
          />
          <input
            id="circle-color-text"
            type="text"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            aria-label="Circle color hex code"
            placeholder="#FF0000"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="opacity-slider"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Fill Opacity: {(fillOpacity * 100).toFixed(0)}%
        </label>
        <input
          id="opacity-slider"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={fillOpacity}
          onChange={(e) => onFillOpacityChange(parseFloat(e.target.value))}
          className="w-full"
          aria-label={`Fill opacity: ${(fillOpacity * 100).toFixed(0)} percent`}
        />
      </div>
    </>
  );
};

export default StyleControls;

