import React from 'react';

// Tab Navigation and Tab Details (1-3) sections
const FlowDiagramTabs: React.FC = () => {
  return (
    <>
      {/* Tab Navigation */}
      <div className="flex flex-col items-center">
        <div className="bg-indigo-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
          <div className="font-bold text-xl mb-3">
            SIX TAB NAVIGATION SYSTEM
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-blue-100 text-blue-900 p-3 rounded font-semibold">
              📝 Tab 1: Audit Logs
            </div>
            <div className="bg-purple-100 text-purple-900 p-3 rounded font-semibold">
              📋 Tab 2: Region Requests
            </div>
            <div className="bg-green-100 text-green-900 p-3 rounded font-semibold">
              👥 Tab 3: Bulk Assignment
            </div>
            <div className="bg-yellow-100 text-yellow-900 p-3 rounded font-semibold">
              ⏰ Tab 4: Temporary Access
            </div>
            <div className="bg-cyan-100 text-cyan-900 p-3 rounded font-semibold">
              📥 Tab 5: Export Reports
            </div>
            <div className="bg-pink-100 text-pink-900 p-3 rounded font-semibold">
              🔑 Tab 6: Password Reset
            </div>
          </div>
          <div className="mt-4 text-sm bg-indigo-700 p-3 rounded">
            Each tab is color-coded and displays distinct functionality
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>

      {/* Tab 1: Audit Logs */}
      <div className="flex flex-col items-center">
        <div className="bg-blue-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
          <div className="font-bold text-xl mb-3">
            TAB 1: 📝 AUDIT LOGS (BLUE THEME)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-100 text-blue-900 p-4 rounded">
              <div className="font-bold mb-2">Filter Options:</div>
              <div>• Filter by User (dropdown)</div>
              <div>
                • Filter by Action (CREATE/UPDATE/DELETE/LOGIN/LOGOUT)
              </div>
              <div>• Filter by Entity (User/Infrastructure/Region)</div>
              <div>• Date Range (Start & End date pickers)</div>
            </div>
            <div className="bg-blue-100 text-blue-900 p-4 rounded">
              <div className="font-bold mb-2">Display & Actions:</div>
              <div>• Table with all system activities</div>
              <div>• Click row → Detail modal (Old vs New values)</div>
              <div>• Export: CSV or PDF buttons</div>
              <div>• Pagination: 50 logs per page</div>
            </div>
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>

      {/* Tab 2: Region Requests */}
      <div className="flex flex-col items-center">
        <div className="bg-purple-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
          <div className="font-bold text-xl mb-3">
            TAB 2: 📋 REGION REQUESTS (PURPLE THEME)
          </div>
          <div className="bg-purple-100 text-purple-900 p-4 rounded text-sm">
            <div className="font-bold mb-2">Request Card Display:</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="font-semibold">Shows:</div>
                <div>• User name & email</div>
                <div>• User role</div>
                <div>• Requested regions (states)</div>
                <div>• Justification text</div>
                <div>• Submission timestamp</div>
              </div>
              <div>
                <div className="font-semibold">Admin Actions:</div>
                <div>• Approve button → Grant access</div>
                <div>• Reject button → Deny access</div>
                <div>• Add optional admin comments</div>
                <div>• Auto-notification to user</div>
                <div>• Status: Pending → Approved/Rejected</div>
              </div>
            </div>
            <div className="bg-purple-200 p-2 rounded font-semibold">
              On Approve: Regions assigned to user, notification displayed
            </div>
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>

      {/* Tab 3: Bulk Assignment */}
      <div className="flex flex-col items-center">
        <div className="bg-green-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
          <div className="font-bold text-xl mb-3">
            TAB 3: 👥 BULK REGION ASSIGNMENT (GREEN THEME)
          </div>
          <div className="bg-green-100 text-green-900 p-4 rounded text-sm">
            <div className="font-bold mb-2">5-Step Process:</div>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded">
                <span className="font-bold">Step 1:</span> Select Users
                (Multi-select dropdown with search)
              </div>
              <div className="bg-white p-2 rounded">
                <span className="font-bold">Step 2:</span> Select Regions
                (Multi-select from 36 Indian states/UTs)
              </div>
              <div className="bg-white p-2 rounded">
                <span className="font-bold">Step 3:</span> Choose
                Operation (Add Mode or Replace Mode)
              </div>
              <div className="bg-white p-2 rounded">
                <span className="font-bold">Step 4:</span> Review Preview
                (Affected users count & regions list)
              </div>
              <div className="bg-white p-2 rounded">
                <span className="font-bold">Step 5:</span> Confirm &
                Assign → Users notified of change
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-green-300 font-bold">
              Add Mode: Adds to existing | Replace Mode: Replaces all
            </div>
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>
    </>
  );
};

export default FlowDiagramTabs;

