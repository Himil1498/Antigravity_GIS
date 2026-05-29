import React from 'react';

// Entry, Key Difference, and Header sections of the flow diagram
const FlowDiagramHeader: React.FC = () => {
  return (
    <>
      {/* START Box */}
      <div className="bg-green-600 text-white px-12 py-6 rounded-lg shadow-lg text-center font-bold text-xl w-full max-w-md">
        START: User Opens Analytics Page
      </div>

      {/* Arrow */}
      <div className="w-1 h-12 bg-gray-400"></div>

      {/* KEY DIFFERENCE Box */}
      <div className="bg-amber-500 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="text-center font-bold text-xl mb-3">
          ⚠️ KEY DIFFERENCE
        </div>
        <div className="text-sm space-y-1">
          <div>📊 Analytics: Shows ALL USERS' DATA (System-Wide)</div>
          <div>🎯 Dashboard: Shows CURRENT USER'S DATA ONLY</div>
        </div>
      </div>

      {/* Arrow */}
      <div className="w-1 h-12 bg-gray-400"></div>

      {/* PAGE HEADER Box */}
      <div className="bg-purple-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="font-bold text-xl mb-3">DISPLAY PAGE HEADER</div>
        <div className="text-sm space-y-1">
          <div>• Title: "Analytics Dashboard"</div>
          <div>• Auto-Refresh Toggle (ON/OFF switch)</div>
          <div>• Manual Refresh Button</div>
          <div>• "Last Refreshed" timestamp display</div>
        </div>
      </div>

      {/* Arrow */}
      <div className="w-1 h-12 bg-gray-400"></div>
    </>
  );
};

export default FlowDiagramHeader;

