import React, { useMemo } from "react";

interface FolderData {
  name: string;
  count: number;
  color: string;
}

interface FolderBreakdownChartProps {
  cards: { title: string; value: string }[];
}

const COLORS = [
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#10B981", // emerald
  "#8B5CF6", // purple
  "#64748B", // slate
  "#F97316", // orange
  "#EC4899", // pink
  "#EF4444", // red
  "#06B6D4", // cyan
  "#14B8A6", // teal
  "#F59E0B", // amber
  "#84CC16", // lime
];

const FolderBreakdownChart: React.FC<FolderBreakdownChartProps> = ({ cards }) => {
  const chartData = useMemo(() => {
    const data: FolderData[] = cards
      .map((card, i) => ({
        name: card.title,
        count: parseInt(card.value.replace(/,/g, "")) || 0,
        color: COLORS[i % COLORS.length],
      }))
      .filter((d) => d.count > 0);

    return data;
  }, [cards]);

  const total = useMemo(() => chartData.reduce((sum, d) => sum + d.count, 0), [chartData]);

  // SVG donut chart
  const renderDonut = () => {
    if (chartData.length === 0 || total === 0) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-gray-400">No data to display</p>
        </div>
      );
    }

    const size = 140;
    const strokeWidth = 28;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {chartData.map((segment, i) => {
              const segmentLength = (segment.count / total) * circumference;
              const dashArray = `${segmentLength} ${circumference - segmentLength}`;
              const currentOffset = offset;
              offset += segmentLength;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={-currentOffset}
                  strokeLinecap="butt"
                  className="transition-all duration-500"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{total.toLocaleString()}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Total</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Folder Breakdown</h3>
        </div>
      </div>

      <div className="p-4">
        {renderDonut()}

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {chartData.map((item, i) => (
            <div key={i} className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.name}</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white ml-auto flex-shrink-0">
                {item.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FolderBreakdownChart;
