import React from "react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  type?: "default" | "latency" | "percentage" | "performance";
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  type = "default"
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-4 min-w-[200px]">
      <p className="text-sm font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
        {label}
      </p>
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {entry.name}:
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {type === "latency"
                ? `${entry.value.toFixed(2)}ms`
                : type === "percentage"
                ? `${entry.value.toFixed(1)}%`
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
        {type === "performance" && payload[0]?.payload?.requests && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Total Requests:
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {payload[0].payload.requests}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomTooltip;

