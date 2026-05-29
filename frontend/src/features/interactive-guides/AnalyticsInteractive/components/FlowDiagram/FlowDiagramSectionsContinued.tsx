import React from 'react';

// Sections 4-5 and Auto-Refresh sections of the flow diagram
const FlowDiagramSectionsContinued: React.FC = () => {
  return (
    <>
      {/* SECTION 4: Usage Trends */}
      <div className="bg-orange-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="font-bold text-xl mb-4 text-center">
          SECTION 4: USAGE TRENDS ANALYSIS
        </div>
        <div className="bg-orange-100 text-orange-900 px-4 py-4 rounded">
          <div className="font-bold mb-3 text-center">📊 Feature Creation Trends</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-1">Time Series Chart:</div>
              <div>• Multi-line graph</div>
              <div>• Track creation over time</div>
              <div>• Time range: 7d, 30d, 90d</div>
              <div>• Color-coded by feature type</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Data Tracked:</div>
              <div>• Distance Measurements</div>
              <div>• Polygons & Circles</div>
              <div>• Elevation Profiles</div>
              <div>• RF Sectors</div>
              <div>• Infrastructure items</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-orange-300">
            <div className="font-bold text-center">Grand Totals Display:</div>
            <div className="text-center text-sm">• Overall counts for each feature</div>
            <div className="text-center text-sm">• Growth percentage indicators</div>
          </div>
        </div>
      </div>

      <div className="w-1 h-12 bg-gray-400"></div>

      {/* SECTION 5: System Health & Activity */}
      <div className="bg-emerald-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="font-bold text-xl mb-4 text-center">
          SECTION 5: SYSTEM HEALTH & RECENT ACTIVITY
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-100 text-emerald-900 px-4 py-4 rounded">
            <div className="font-bold mb-2 text-center">💚 System Health Monitor</div>
            <div className="text-sm space-y-1">
              <div>• Database status (✅/❌)</div>
              <div>• API status badge</div>
              <div>• WebSocket connection status</div>
              <div>• System uptime display</div>
              <div>• Last health check timestamp</div>
              <div>• Color-coded indicators</div>
            </div>
          </div>
          <div className="bg-emerald-100 text-emerald-900 px-4 py-4 rounded">
            <div className="font-bold mb-2 text-center">📋 Recent Activity Feed</div>
            <div className="text-sm space-y-1">
              <div>• Last 10 user actions</div>
              <div>• User avatar & name</div>
              <div>• Action type (Create/Update/Delete)</div>
              <div>• Timestamp (relative time)</div>
              <div>• Color coding by action</div>
              <div>• Real-time WebSocket updates</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1 h-12 bg-gray-400"></div>

      {/* AUTO-REFRESH Box */}
      <div className="bg-indigo-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="font-bold text-xl mb-3 text-center">
          🔄 AUTO-REFRESH SYSTEM
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-indigo-100 text-indigo-900 px-3 py-3 rounded">
            <div className="font-semibold mb-1">When Auto-Refresh ON:</div>
            <div>• Refreshes every 60 seconds</div>
            <div>• Updates all sections automatically</div>
            <div>• Shows refresh icon animation</div>
          </div>
          <div className="bg-indigo-100 text-indigo-900 px-3 py-3 rounded">
            <div className="font-semibold mb-1">Manual Refresh Button:</div>
            <div>• Click to update instantly</div>
            <div>• Shows loading spinner</div>
            <div>• Updates timestamp</div>
          </div>
        </div>
      </div>

      <div className="w-1 h-12 bg-gray-400"></div>
    </>
  );
};

export default FlowDiagramSectionsContinued;

