import React from 'react';

// User Interactions, Visual Features, End, Summary, and Legend
const FlowDiagramFooter: React.FC = () => {
  return (
    <>
      {/* USER INTERACTIONS Box */}
      <div className="bg-pink-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="font-bold text-xl mb-3 text-center">👆 USER INTERACTIONS</div>
        <div className="text-sm space-y-1">
          <div>• Toggle auto-refresh ON/OFF</div>
          <div>• Click manual refresh button</div>
          <div>• Select time range for charts (1h/6h/24h/7d)</div>
          <div>• Select trend period (7d/30d/90d)</div>
          <div>• Hover over charts for detailed tooltips</div>
          <div>• View individual card details</div>
          <div>• Scroll through recent activity feed</div>
        </div>
      </div>

      <div className="w-1 h-12 bg-gray-400"></div>

      {/* VISUAL FEATURES Box */}
      <div className="bg-teal-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="font-bold text-xl mb-4 text-center">🎨 VISUAL FEATURES</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-teal-100 text-teal-900 px-3 py-3 rounded text-sm">
            <div className="font-semibold mb-1">Color Coding:</div>
            <div>• Green - Active/Healthy</div>
            <div>• Red - Inactive/Error</div>
            <div>• Amber - Maintenance/Warning</div>
            <div>• Blue - Create actions</div>
          </div>
          <div className="bg-teal-100 text-teal-900 px-3 py-3 rounded text-sm">
            <div className="font-semibold mb-1">Charts & Graphs:</div>
            <div>• Interactive line charts</div>
            <div>• Progress bars</div>
            <div>• Status badges</div>
            <div>• Animated counters</div>
          </div>
          <div className="bg-teal-100 text-teal-900 px-3 py-3 rounded text-sm">
            <div className="font-semibold mb-1">Icons & Badges:</div>
            <div>• Category icons for each type</div>
            <div>• Status indicators</div>
            <div>• User avatars</div>
            <div>• Action type icons</div>
          </div>
          <div className="bg-teal-100 text-teal-900 px-3 py-3 rounded text-sm">
            <div className="font-semibold mb-1">Responsive Design:</div>
            <div>• Mobile-friendly layout</div>
            <div>• Grid adjusts to screen size</div>
            <div>• Scrollable sections</div>
            <div>• Touch-friendly controls</div>
          </div>
        </div>
      </div>

      <div className="w-1 h-12 bg-gray-400"></div>

      {/* END Box */}
      <div className="bg-green-600 text-white px-12 py-6 rounded-lg shadow-lg text-center font-bold text-xl w-full max-w-md">
        END: Analytics Dashboard Fully Loaded
      </div>

      {/* Flow Summary */}
      <div className="bg-white dark:bg-gray-800 border-4 border-gray-800 dark:border-gray-600 rounded-lg p-6 mt-12 shadow-xl w-full">
        <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">
          📊 COMPLETE FLOW SUMMARY
        </h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {[
            { num: 1, color: 'bg-green-600', text: 'User opens Analytics page → Shows system-wide data for ALL users' },
            { num: 2, color: 'bg-purple-600', text: 'Display header with title, auto-refresh toggle, manual refresh button' },
            { num: 3, color: 'bg-blue-600', text: 'Section 1: Show 8 infrastructure KPI cards with totals & status breakdowns' },
            { num: 4, color: 'bg-violet-600', text: 'Section 2: Display user statistics & tool usage analytics' },
            { num: 5, color: 'bg-cyan-600', text: 'Section 3: Show API performance with latency charts & top endpoints' },
            { num: 6, color: 'bg-orange-600', text: 'Section 4: Display usage trends with time series charts' },
            { num: 7, color: 'bg-emerald-600', text: 'Section 5: Show system health status & recent activity feed' },
            { num: 8, color: 'bg-indigo-600', text: 'Auto-refresh every 60 seconds (if enabled) or manual refresh on demand' }
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-3">
              <div className={`${item.color} text-white px-3 py-1 rounded font-bold flex-shrink-0`}>{item.num}</div>
              <div>{item.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-gray-300 dark:border-gray-600 mt-8 mb-8 w-full">
        <h3 className="font-bold text-xl mb-4 text-gray-800 dark:text-white text-center">LEGEND FOR VISIO:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { color: 'bg-green-600', label: 'Start/End Points' },
            { color: 'bg-purple-600', label: 'Header/Navigation' },
            { color: 'bg-blue-600', label: 'Section 1 (Infrastructure)' },
            { color: 'bg-violet-600', label: 'Section 2 (Users & Tools)' },
            { color: 'bg-cyan-600', label: 'Section 3 (Performance)' },
            { color: 'bg-orange-600', label: 'Section 4 (Trends)' },
            { color: 'bg-emerald-600', label: 'Section 5 (Health & Activity)' },
            { color: 'bg-indigo-600', label: 'System Features' },
            { color: 'bg-amber-500', label: 'Important Notes' },
            { color: 'bg-pink-600', label: 'User Interactions' },
            { color: 'bg-teal-600', label: 'Visual Features' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-12 h-8 ${item.color} rounded`}></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-gray-400"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Flow Arrows</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlowDiagramFooter;

