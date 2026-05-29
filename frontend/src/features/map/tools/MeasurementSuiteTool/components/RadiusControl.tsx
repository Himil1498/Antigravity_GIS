import React from "react";

interface RadiusControlProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
  formatDistance: (meters: number) => string;
}

const RadiusControl: React.FC<RadiusControlProps> = ({
  radius,
  onRadiusChange,
  formatDistance,
}) => {
  const presetRadii = [
    { label: "500m", value: 500 },
    { label: "1km", value: 1000 },
    { label: "2km", value: 2000 },
    { label: "5km", value: 5000 },
    { label: "10km", value: 10000 },
  ];

  return (
    <div className="mb-4">
      <label
        htmlFor="radius-slider"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Radius: {formatDistance(radius)}
      </label>
      <input
        id="radius-slider"
        type="range"
        min="100"
        max="50000"
        step="100"
        value={radius}
        onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
        className="w-full mb-2"
        aria-label={`Circle radius: ${formatDistance(radius)}`}
      />
      <div className="flex gap-2 flex-wrap">
        {presetRadii.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onRadiusChange(preset.value)}
            className={`px-3 py-1 text-xs font-medium rounded-md ${
              Math.abs(radius - preset.value) < 50
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RadiusControl;

