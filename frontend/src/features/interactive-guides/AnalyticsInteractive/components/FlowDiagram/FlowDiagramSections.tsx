import React from "react";

// Sections 1-3 of the flow diagram
const FlowDiagramSections: React.FC = () => {
  return (
    <>
      {/* SECTION 1: Infrastructure KPI Cards */}
      <div className="bg-blue-600 text-white px-8 py-8 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="font-bold text-xl mb-4 text-center">
          SECTION 1: INFRASTRUCTURE KPI CARDS
        </div>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded text-center text-sm font-semibold">
            1. POP
          </div>
          <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded text-center text-sm font-semibold">
            2. Sub POP
          </div>
          <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded text-center text-sm font-semibold">
            3. BTS-CO-LO
          </div>
          <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded text-center text-sm font-semibold">
            4. Bandwidth BTS
          </div>
          <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded text-center text-sm font-semibold">
            5. Office Location
          </div>
          <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded text-center text-sm font-semibold">
            6. NNI
          </div>
          <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded text-center text-sm font-semibold">
            7. Data Center
          </div>
          <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded text-center text-sm font-semibold">
            8. Customer
          </div>
        </div>
        <div className="bg-blue-700 px-4 py-3 rounded text-sm">
          <div className="font-bold mb-2">Each Card Shows:</div>
          <div>• Total count (all users combined)</div>
          <div>• Status breakdown: Active, Inactive, Maintenance, etc.</div>
          <div>• Color-coded progress bar</div>
          <div>• Category icon</div>
        </div>
      </div>

      <div className="w-1 h-12 bg-gray-400"></div>

      {/* SECTION 2: User & Tool Analytics */}
      <div className="bg-violet-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="font-bold text-xl mb-4 text-center">
          SECTION 2: USER & TOOL ANALYTICS
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-violet-100 text-violet-900 px-4 py-4 rounded">
            <div className="font-bold mb-2 text-center">👥 User Statistics</div>
            <div className="text-sm space-y-1">
              <div>• Total registered users</div>
              <div>• Active users count</div>
              <div>• User growth metrics</div>
            </div>
          </div>
          <div className="bg-violet-100 text-violet-900 px-4 py-4 rounded">
            <div className="font-bold mb-2 text-center">
              🛠️ Tool Usage Stats
            </div>
            <div className="text-sm space-y-1">
              <div>• Distance Measurements</div>
              <div>• Elevation Profiles</div>
              <div>• Polygon/Circle Drawings</div>
              <div>• RF Sector Tools</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1 h-12 bg-gray-400"></div>

      {/* SECTION 3: API Performance */}
      <div className="bg-cyan-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="font-bold text-xl mb-4 text-center">
          SECTION 3: API PERFORMANCE MONITORING
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-cyan-100 text-cyan-900 px-4 py-4 rounded">
            <div className="font-bold mb-2 text-center">📈 Latency Chart</div>
            <div className="text-sm space-y-1">
              <div>• Interactive line graph</div>
              <div>• Time range selector: 1h, 6h, 24h, 7d</div>
              <div>• Shows avg/min/max response time</div>
              <div>• Real-time updates</div>
            </div>
          </div>
          <div className="bg-cyan-100 text-cyan-900 px-4 py-4 rounded">
            <div className="font-bold mb-2 text-center">
              🎯 Top 10 API Endpoints
            </div>
            <div className="text-sm space-y-1">
              <div>• Most called endpoints list</div>
              <div>• Request count per endpoint</div>
              <div>• Average response time</div>
              <div>• Success rate percentage</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1 h-12 bg-gray-400"></div>
    </>
  );
};

export default FlowDiagramSections;

