import React from 'react';

export interface MetricGaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: 'blue' | 'purple' | 'orange' | 'green';
  threshold: { warning: number; critical: number };
}

const MetricGauge: React.FC<MetricGaugeProps> = ({ label, value, max, unit, color, threshold }) => {
  const percentage = (value / max) * 100;

  const getGaugeColor = (): string => {
    if (value >= threshold.critical) return 'bg-red-500';
    if (value >= threshold.warning) return 'bg-yellow-500';
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      case 'orange': return 'bg-orange-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getTextColor = (): string => {
    if (value >= threshold.critical) return 'text-red-600 dark:text-red-400';
    if (value >= threshold.warning) return 'text-yellow-600 dark:text-yellow-400';
    switch (color) {
      case 'blue': return 'text-blue-600 dark:text-blue-400';
      case 'purple': return 'text-purple-600 dark:text-purple-400';
      case 'orange': return 'text-orange-600 dark:text-orange-400';
      case 'green': return 'text-green-600 dark:text-green-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className={`text-lg font-bold ${getTextColor()}`}>{value}{unit}</span>
      </div>
      <div className="relative">
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${getGaugeColor()} transition-all duration-500 ease-out relative`} style={{ width: `${Math.min(percentage, 100)}%` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
        <div className="absolute top-0 h-3 w-full pointer-events-none">
          <div className="absolute top-0 h-full w-0.5 bg-yellow-400 opacity-50" style={{ left: `${(threshold.warning / max) * 100}%` }}></div>
          <div className="absolute top-0 h-full w-0.5 bg-red-400 opacity-50" style={{ left: `${(threshold.critical / max) * 100}%` }}></div>
        </div>
      </div>
      {value >= threshold.critical && <p className="text-xs text-red-600 dark:text-red-400 mt-1">⚠️ Critical level reached</p>}
      {value >= threshold.warning && value < threshold.critical && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">⚠ Warning level reached</p>}
    </div>
  );
};

export default MetricGauge;

