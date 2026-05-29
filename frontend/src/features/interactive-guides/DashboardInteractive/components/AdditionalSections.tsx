import React from 'react';
import { useCases, proTips } from '../data/index';

// Auto-Refresh Section
export const AutoRefreshSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">🔄 Auto-Refresh System</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white bg-opacity-10 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-3">⏰ Every 5 Minutes</h3>
          <p className="text-sm mb-2 font-semibold">Infrastructure KPI Cards</p>
          <ul className="text-sm space-y-1">
            <li>• All 9 cards update</li>
            <li>• Counts recalculated</li>
            <li>• Status breakdown refreshed</li>
            <li>• Manual refresh available</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-3">⏱️ Every 60 Seconds</h3>
          <p className="text-sm mb-2 font-semibold">Recent Activity Feed</p>
          <ul className="text-sm space-y-1">
            <li>• Latest 10 activities</li>
            <li>• Timestamps updated</li>
            <li>• New actions appear</li>
            <li>• Color dots refresh</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-3">⏱️ Every 60 Seconds</h3>
          <p className="text-sm mb-2 font-semibold">System Overview</p>
          <ul className="text-sm space-y-1">
            <li>• Health percentages</li>
            <li>• Progress bars update</li>
            <li>• Coverage recalculated</li>
            <li>• Utilization refreshed</li>
          </ul>
        </div>
      </div>
      <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg text-center">
        <p className="text-sm">
          <strong>WebSocket Connection:</strong> Real-time updates when infrastructure changes occur
        </p>
      </div>
    </div>
  );
};

// Quick Reference Section
export const QuickReferenceSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">⚡ Quick Reference</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-3">📊 What You'll See</h3>
          <ul className="text-sm space-y-2">
            <li>• 9 infrastructure KPI cards (8 types + 1 total)</li>
            <li>• Your recent 10 activities with timestamps</li>
            <li>• 3 system health metrics with progress bars</li>
            <li>• Customer breakdown by telecom operator</li>
            <li>• Maintenance alerts if items need attention</li>
            <li>• Color-coded activity dots by type</li>
            <li>• Welcome message with your profile info</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-3">🎯 How to Use</h3>
          <ul className="text-sm space-y-2">
            <li>• Check dashboard daily for health overview</li>
            <li>• Monitor activity feed for recent changes</li>
            <li>• Use manual refresh button when needed</li>
            <li>• Watch maintenance alerts for action items</li>
            <li>• Review health metrics for issues</li>
            <li>• Hover over cards for additional details</li>
            <li>• Toggle dark mode for comfort</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Time Format Guide Section
export const TimeFormatSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-pink-600 to-red-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">⏰ Relative Time Format Guide</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Recent (Minutes/Hours)</h3>
          <ul className="text-sm space-y-1">
            <li>• <strong>Just now</strong> - Less than 1 minute</li>
            <li>• <strong>5 minutes ago</strong> - 5 mins back</li>
            <li>• <strong>30 minutes ago</strong> - Half hour</li>
            <li>• <strong>2 hours ago</strong> - Earlier today</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Recent (Days)</h3>
          <ul className="text-sm space-y-1">
            <li>• <strong>Yesterday</strong> - Previous day</li>
            <li>• <strong>2 days ago</strong> - Two days back</li>
            <li>• <strong>5 days ago</strong> - Earlier this week</li>
            <li>• <strong>6 days ago</strong> - Last week</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Older (Dates)</h3>
          <ul className="text-sm space-y-1">
            <li>• <strong>11/14/2025</strong> - 7+ days ago</li>
            <li>• <strong>10/28/2025</strong> - Last month</li>
            <li>• <strong>09/15/2025</strong> - Older entries</li>
            <li>• <strong>MM/DD/YYYY</strong> - Standard format</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Use Cases Section
export const UseCasesSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">🎯 Common Use Cases</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {useCases.map((useCase, idx) => (
          <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
            <h3 className="font-bold mb-2">{useCase.title}</h3>
            <p className="text-sm">{useCase.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pro Tips Section
export const ProTipsSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-8 mt-8 mb-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">💡 Pro Tips</h2>
      <div className="space-y-3">
        {proTips.map((tip, idx) => (
          <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
            <p className="font-bold mb-1">{tip.title}</p>
            <p className="text-sm">{tip.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Summary Stats Section
export const SummaryStatsSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 mt-8 mb-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">📊 Dashboard at a Glance</h2>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white bg-opacity-10 p-6 rounded-lg text-center">
          <div className="text-4xl font-bold mb-2">9</div>
          <div className="text-sm">KPI Cards</div>
          <div className="text-xs opacity-75 mt-1">8 types + 1 total</div>
        </div>
        <div className="bg-white bg-opacity-10 p-6 rounded-lg text-center">
          <div className="text-4xl font-bold mb-2">3</div>
          <div className="text-sm">Health Metrics</div>
          <div className="text-xs opacity-75 mt-1">Network, Coverage, Utilization</div>
        </div>
        <div className="bg-white bg-opacity-10 p-6 rounded-lg text-center">
          <div className="text-4xl font-bold mb-2">10</div>
          <div className="text-sm">Recent Activities</div>
          <div className="text-xs opacity-75 mt-1">Your actions only</div>
        </div>
        <div className="bg-white bg-opacity-10 p-6 rounded-lg text-center">
          <div className="text-4xl font-bold mb-2">5</div>
          <div className="text-sm">Telecom Operators</div>
          <div className="text-xs opacity-75 mt-1">Customer breakdown</div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold mb-1">5 min</div>
          <div className="text-xs">KPI Auto-Refresh</div>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold mb-1">60 sec</div>
          <div className="text-xs">Activity/Health Refresh</div>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold mb-1">Real-time</div>
          <div className="text-xs">WebSocket Updates</div>
        </div>
      </div>
    </div>
  );
};

