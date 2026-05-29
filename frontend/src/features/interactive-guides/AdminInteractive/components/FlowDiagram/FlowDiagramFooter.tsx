import React from 'react';

// Security, Flow Summary, and Legend sections
const FlowDiagramFooter: React.FC = () => {
  return (
    <>
      {/* Security & Permissions */}
      <div className="flex flex-col items-center">
        <div className="bg-red-500 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-2xl">
          <div className="font-bold text-xl mb-3">
            🔒 SECURITY & PERMISSIONS
          </div>
          <div className="bg-red-100 text-red-900 p-4 rounded text-sm space-y-2">
            <div>• Only Admin role can access any tab</div>
            <div>• Non-admin users see "Access Denied"</div>
            <div>• All actions logged in Audit Logs tab</div>
            <div>• Confirmation dialogs for critical actions</div>
            <div>• Countdown timers for temporary access</div>
            <div>• Visual indicators for access status</div>
            <div>• Email notification status displayed</div>
          </div>
        </div>
        <div className="w-0.5 h-12 bg-gray-400"></div>
      </div>

      {/* End */}
      <div className="flex flex-col items-center">
        <div className="bg-red-600 text-white px-8 py-4 rounded-lg shadow-lg font-bold">
          END: Admin Panel Fully Functional
        </div>
      </div>

      {/* Complete Flow Summary */}
      <div className="bg-white border-4 border-red-600 rounded-lg p-6 mt-8 shadow-xl">
        <h3 className="text-2xl font-bold mb-4 text-center text-red-600">
          ⚙️ COMPLETE ADMIN PANEL FLOW
        </h3>
        <div className="space-y-2 text-sm">
          <FlowSummaryStep num={1} color="bg-red-600" text="Admin user logs in → System verifies Admin role" />
          <FlowSummaryStep num={2} color="bg-purple-600" text="Navigate to /admin route via menu or direct URL" />
          <FlowSummaryStep num={3} color="bg-red-500" text="Display admin panel header with title and administrator badge" />
          <FlowSummaryStep num={4} color="bg-indigo-600" text="Show six color-coded tabs: Audit, Requests, Bulk, Temporary, Reports, Password" />
          <FlowSummaryStep num={5} color="bg-blue-600" text="Tab 1 (Blue): View & filter audit logs, export to CSV/PDF" />
          <FlowSummaryStep num={6} color="bg-purple-600" text="Tab 2 (Purple): Approve/reject region access requests with notifications" />
          <FlowSummaryStep num={7} color="bg-green-600" text="Tab 3 (Green): Bulk assign regions to multiple users (Add/Replace modes)" />
          <FlowSummaryStep num={8} color="bg-yellow-600" text="Tab 4 (Yellow): Grant temporary access with expiry & countdown timers" />
          <FlowSummaryStep num={9} color="bg-cyan-600" text="Tab 5 (Cyan): Generate & download reports in Excel/PDF/CSV formats" />
          <FlowSummaryStep num={10} color="bg-pink-600" text="Tab 6 (Pink): Handle password resets via link or temporary password" />
          <FlowSummaryStep num={11} color="bg-purple-500" text="All actions logged, users notified, real-time updates throughout" />
        </div>
      </div>

      {/* Legend for Visio */}
      <div className="mt-12 bg-white p-6 rounded-lg shadow-lg border-2 border-gray-300">
        <h3 className="font-bold text-xl mb-4 text-gray-800">
          LEGEND FOR VISIO DIAGRAM:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <LegendItem color="bg-red-600" label="Start/End & Header" />
          <LegendItem color="bg-yellow-500" label="Access Control" />
          <LegendItem color="bg-purple-500" label="Navigation/Actions" />
          <LegendItem color="bg-indigo-600" label="Tab System" />
          <LegendItem color="bg-blue-600" label="Tab 1: Audit Logs" />
          <LegendItem color="bg-purple-600" label="Tab 2: Requests" />
          <LegendItem color="bg-green-600" label="Tab 3: Bulk Assign" />
          <LegendItem color="bg-yellow-600" label="Tab 4: Temporary" />
          <LegendItem color="bg-cyan-600" label="Tab 5: Reports" />
          <LegendItem color="bg-pink-600" label="Tab 6: Password" />
          <LegendItem color="bg-teal-500" label="Visual Design" />
          <LegendItem color="bg-red-500" label="Security Features" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-gray-400"></div>
            <span className="text-sm">Flow Arrows</span>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper components
const FlowSummaryStep: React.FC<{ num: number; color: string; text: string }> = ({ num, color, text }) => (
  <div className="flex items-center gap-3">
    <div className={`${color} text-white px-3 py-1 rounded font-bold min-w-[40px] text-center`}>
      {num}
    </div>
    <div>{text}</div>
  </div>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-12 h-8 ${color} rounded`}></div>
    <span className="text-sm">{label}</span>
  </div>
);

export default FlowDiagramFooter;

