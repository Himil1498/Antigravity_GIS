import React from 'react';

// Entry and Access Check sections of the flow diagram
const FlowDiagramHeader: React.FC = () => {
  return (
    <>
      {/* Entry Point */}
      <div className="flex flex-col items-center">
        <div className="bg-red-600 text-white px-8 py-4 rounded-lg shadow-lg text-center font-bold">
          START: Admin User Logs In
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>

      {/* Access Check */}
      <div className="flex flex-col items-center">
        <div className="bg-yellow-500 text-white px-8 py-6 rounded-lg shadow-lg text-center max-w-2xl">
          <div className="font-bold text-xl mb-2">
            🔐 ACCESS CONTROL CHECK
          </div>
          <div className="text-sm">
            System verifies user role = "Admin"
          </div>
          <div className="text-sm mt-2">
            ✅ Admin Role → Proceed to Admin Panel
          </div>
          <div className="text-sm">
            ❌ Non-Admin → Show "Access Denied" page
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col items-center">
        <div className="bg-purple-500 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-2xl">
          <div className="font-bold text-lg mb-2">
            NAVIGATION TO ADMIN PANEL
          </div>
          <div className="text-sm space-y-1">
            <div>
              • Option 1: Click "Administration" in main navigation menu
            </div>
            <div>• Option 2: Direct URL access to /admin route</div>
            <div>• System routes to administration panel</div>
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>

      {/* Panel Header */}
      <div className="flex flex-col items-center">
        <div className="bg-red-500 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
          <div className="font-bold text-xl mb-3">
            DISPLAY ADMIN PANEL HEADER
          </div>
          <div className="bg-red-100 text-red-900 p-4 rounded text-sm">
            <div className="font-bold mb-2">⚙️ Header Components:</div>
            <div>• Large red gear icon (🛡)</div>
            <div>• Title: "Administration Panel"</div>
            <div>
              • Subtitle: "System administration and region management"
            </div>
            <div>• Administrator badge on right side</div>
            <div>• Red gradient background theme</div>
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>
    </>
  );
};

export default FlowDiagramHeader;

