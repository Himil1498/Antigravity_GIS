import React, { useMemo } from "react";

interface PeakUsagePanelProps {
  data: any[];
  loading: boolean;
  error: string | null;
}

const PeakUsagePanel: React.FC<PeakUsagePanelProps> = ({
  data,
  loading,
  error,
}) => {
  // Aggregate data by hour (0-23)
  const hourlyData = useMemo(() => {
    const hours = new Array(24).fill(0);
    if (!data || !Array.isArray(data)) return hours;

    data.forEach((row) => {
      const hour = parseInt(row.hour_of_day, 10);
      const count = parseInt(row.count, 10);
      if (!isNaN(hour) && !isNaN(count) && hour >= 0 && hour < 24) {
        hours[hour] += count;
      }
    });

    return hours;
  }, [data]);

  const maxCount = Math.max(...hourlyData, 1);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full min-h-[300px]">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="flex items-end h-32 gap-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-900 dark:text-white font-bold">Failed to load Peak Usage</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-900/10 dark:to-amber-900/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-500/20 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Peak Usage Times</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wide">Activity by hour of day</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-end">
        <div className="flex items-end justify-between gap-1 h-40 group">
          {hourlyData.map((count, hour) => {
            const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const isWorkingHour = hour >= 9 && hour <= 18;
            
            return (
              <div key={hour} className="relative flex flex-col items-center flex-1 h-full justify-end">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-700 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                  <br />
                  <span className="font-bold">{count} actions</span>
                </div>
                
                {/* Bar */}
                <div 
                  className={`w-full rounded-t-sm transition-all duration-500 hover:opacity-80 cursor-pointer
                    ${isWorkingHour ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-amber-300 dark:bg-amber-700/50'}
                  `}
                  style={{ height: `${Math.max(heightPercent, 2)}%` }} // Minimum 2% height for visibility
                ></div>
              </div>
            );
          })}
        </div>
        
        {/* X-Axis Labels */}
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-[10px] font-bold text-gray-400 uppercase">12 AM</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">6 AM</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">12 PM</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">6 PM</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">11 PM</span>
        </div>
      </div>
    </div>
  );
};

export default PeakUsagePanel;
