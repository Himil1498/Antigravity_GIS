import React from 'react';

// Common Features, User Interactions, and Visual Design sections
const FlowDiagramFeatures: React.FC = () => {
  return (
    <>
      {/* Common Features Across Tabs */}
      <div className="flex flex-col items-center">
        <div className="bg-indigo-500 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
          <div className="font-bold text-xl mb-3">
            🔄 COMMON FEATURES ACROSS ALL TABS
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-indigo-100 text-indigo-900 p-4 rounded">
              <div className="font-bold mb-2">Notifications:</div>
              <div>• In-app notification display</div>
              <div>• Email notification status shown</div>
              <div>• Status change alerts displayed</div>
              <div>• Real-time UI updates</div>
            </div>
            <div className="bg-indigo-100 text-indigo-900 p-4 rounded">
              <div className="font-bold mb-2">UI Elements:</div>
              <div>• Color-coded tab themes</div>
              <div>• Search & filter capabilities</div>
              <div>• Modal dialogs for details</div>
              <div>• Confirmation dialogs</div>
            </div>
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>

      {/* User Interactions */}
      <div className="flex flex-col items-center">
        <div className="bg-purple-500 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
          <div className="font-bold text-xl mb-3">
            👆 ADMIN USER INTERACTIONS
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-purple-100 text-purple-900 p-3 rounded">
              <div className="font-semibold">Navigation:</div>
              <div>• Switch between tabs</div>
              <div>• Click cards/rows</div>
              <div>• Open detail modals</div>
            </div>
            <div className="bg-purple-100 text-purple-900 p-3 rounded">
              <div className="font-semibold">Filtering:</div>
              <div>• Use dropdown filters</div>
              <div>• Set date ranges</div>
              <div>• Search by keywords</div>
            </div>
            <div className="bg-purple-100 text-purple-900 p-3 rounded">
              <div className="font-semibold">Actions:</div>
              <div>• Approve/Reject requests</div>
              <div>• Assign regions</div>
              <div>• Grant/Revoke access</div>
            </div>
            <div className="bg-purple-100 text-purple-900 p-3 rounded">
              <div className="font-semibold">Data Entry:</div>
              <div>• Multi-select dropdowns</div>
              <div>• Date/time pickers</div>
              <div>• Text input fields</div>
            </div>
            <div className="bg-purple-100 text-purple-900 p-3 rounded">
              <div className="font-semibold">Export:</div>
              <div>• Generate reports</div>
              <div>• Download files</div>
              <div>• Choose formats</div>
            </div>
            <div className="bg-purple-100 text-purple-900 p-3 rounded">
              <div className="font-semibold">Management:</div>
              <div>• View audit logs</div>
              <div>• Reset passwords</div>
              <div>• Monitor activity</div>
            </div>
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>

      {/* Visual Design Elements */}
      <div className="flex flex-col items-center">
        <div className="bg-teal-500 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
          <div className="font-bold text-xl mb-3">
            🎨 VISUAL DESIGN ELEMENTS
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-teal-100 text-teal-900 p-3 rounded">
              <div className="font-semibold">Tab Colors:</div>
              <div>🔵 Blue - Audit</div>
              <div>🟣 Purple - Requests</div>
              <div>🟢 Green - Bulk</div>
              <div>🟡 Yellow - Temporary</div>
            </div>
            <div className="bg-teal-100 text-teal-900 p-3 rounded">
              <div className="font-semibold">More Colors:</div>
              <div>🔷 Cyan - Reports</div>
              <div>💗 Pink - Password</div>
              <div>🔴 Red - Header</div>
              <div>🟣 Purple - System</div>
            </div>
            <div className="bg-teal-100 text-teal-900 p-3 rounded">
              <div className="font-semibold">Status Colors:</div>
              <div>✅ Green - Active</div>
              <div>⚠️ Yellow - Warning</div>
              <div>❌ Red - Inactive</div>
              <div>⏳ Gray - Pending</div>
            </div>
            <div className="bg-teal-100 text-teal-900 p-3 rounded">
              <div className="font-semibold">UI Components:</div>
              <div>• Icons & badges</div>
              <div>• Cards & tables</div>
              <div>• Buttons & forms</div>
              <div>• Modals & toasts</div>
            </div>
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>
    </>
  );
};

export default FlowDiagramFeatures;

