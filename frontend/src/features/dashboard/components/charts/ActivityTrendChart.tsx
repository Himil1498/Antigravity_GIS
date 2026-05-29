import React from "react";
import { ActivityTrendChartProps } from '../../types/userStats.types';
import { getDayAbbreviation } from '../../utils/userFormatters';

const ActivityTrendChart: React.FC<ActivityTrendChartProps> = ({
  dailyData,
}) => {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Activity Trend (Last 7 Days)
        </h4>
        <div className="flex items-center justify-center h-24 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No activity data available
          </p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...dailyData);

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Activity Trend (Last 7 Days)
      </h4>
      <div className="flex items-end justify-between space-x-2 h-24">
        {dailyData.map((count, index) => {
          const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const day = getDayAbbreviation(index);

          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative group ${
                  count > 0 ? "min-h-[4px]" : "min-h-0"
                }`}
                style={{ height: `${height}%` }}
                title={`${count} active users`}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {count} users
                </div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTrendChart;

