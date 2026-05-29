import React from 'react';

// Tabs 4-6 sections of the flow diagram
const FlowDiagramTabsContinued: React.FC = () => {
  return (
    <>
      {/* Tab 4: Temporary Access */}
      <div className="flex flex-col items-center">
        <div className="bg-yellow-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
          <div className="font-bold text-xl mb-3">
            TAB 4: ⏰ TEMPORARY ACCESS (YELLOW THEME)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-yellow-100 text-yellow-900 p-4 rounded">
              <div className="font-bold mb-2">Grant New Access:</div>
              <div>• Select user (dropdown)</div>
              <div>• Choose regions (multi-select)</div>
              <div>• Set expiry date & time</div>
              <div>
                • Duration presets: 1 day, 1 week, 1 month, Custom
              </div>
              <div>• Click "Grant Access" button</div>
              <div>• User receives notification</div>
            </div>
            <div className="bg-yellow-100 text-yellow-900 p-4 rounded">
              <div className="font-bold mb-2">Active Access List:</div>
              <div>• Shows all current grants</div>
              <div>• Real-time countdown timer</div>
              <div>• Color coding:</div>
              <div>&nbsp;&nbsp;🟢 Green: &gt;7 days</div>
              <div>&nbsp;&nbsp;🟡 Yellow: 1-7 days</div>
              <div>&nbsp;&nbsp;🔴 Red: &lt;24 hours</div>
              <div>• Extend or Revoke buttons</div>
            </div>
          </div>
          <div className="mt-3 bg-yellow-700 p-3 rounded text-sm">
            Access automatically expires based on set timer
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>

      {/* Tab 5: Export Reports */}
      <div className="flex flex-col items-center">
        <div className="bg-cyan-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
          <div className="font-bold text-xl mb-3">
            TAB 5: 📥 EXPORT REPORTS (CYAN THEME)
          </div>
          <div className="bg-cyan-100 text-cyan-900 p-4 rounded text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-bold mb-2">6 Report Types:</div>
                <div>1. User Activity Report</div>
                <div>2. Region Assignment Report</div>
                <div>3. Infrastructure Report</div>
                <div>4. Tool Usage Report</div>
                <div>5. Audit Log Report</div>
                <div>6. Custom Report</div>
              </div>
              <div>
                <div className="font-bold mb-2">Configuration:</div>
                <div>• Set date range (from/to)</div>
                <div>• Apply filters (user/region/type)</div>
                <div>• Select data fields</div>
                <div>• Choose format: Excel/PDF/CSV</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-cyan-300">
              <div className="font-bold">Export Formats:</div>
              <div>📊 Excel: XLSX with multiple sheets</div>
              <div>📄 PDF: Formatted document with charts</div>
              <div>📋 CSV: Plain text comma-separated</div>
            </div>
            <div className="mt-3 bg-cyan-200 p-2 rounded font-bold">
              Click "Generate Report" → Automatic download when ready
            </div>
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>

      {/* Tab 6: Password Reset */}
      <div className="flex flex-col items-center">
        <div className="bg-pink-600 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
          <div className="font-bold text-xl mb-3">
            TAB 6: 🔑 PASSWORD RESET (PINK THEME)
          </div>
          <div className="bg-pink-100 text-pink-900 p-4 rounded text-sm">
            <div className="font-bold mb-2">Request Display:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <div className="font-semibold">Each request shows:</div>
                <div>• User name & email</div>
                <div>• Request timestamp</div>
                <div>• Optional reason</div>
                <div>• Status: Pending/Sent/Completed</div>
              </div>
              <div>
                <div className="font-semibold">Admin Action Options:</div>
                <div>Option 1: Send Reset Link</div>
                <div>• Display reset link option</div>
                <div>• Show link generation status</div>
                <div>• User receives reset interface</div>
              </div>
            </div>
            <div className="bg-pink-200 p-3 rounded">
              <div className="font-bold mb-1">
                Option 2: Set Temporary Password
              </div>
              <div>• Admin sets temp password in UI</div>
              <div>• User receives password notification</div>
              <div>• User required to change on next login</div>
            </div>
            <div className="mt-3 bg-white p-2 rounded font-bold">
              After action: Status → "Sent" | After user completes: Status
              → "Completed"
            </div>
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>
    </>
  );
};

export default FlowDiagramTabsContinued;

