import React from 'react';
import { sections, features } from '../data/index';
import { getColorClasses } from '../utils';

// Dashboard Sections Overview
export const DashboardSectionsOverview: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        📋 Dashboard Sections Overview
      </h2>
      <div className="space-y-6">
        {sections.map((section, idx) => {
          const detailClasses = getColorClasses(section.color).split(" ").slice(2).join(" ");
          return (
            <div key={idx} className={`p-6 rounded-lg border-l-4 ${detailClasses}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">{section.icon}</span>
                <span>{section.title}</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {section.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700"
                  >
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Key Features Section
export const KeyFeaturesSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        ✨ Key Features
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature, idx) => {
          const detailClasses = getColorClasses(feature.color).split(" ").slice(2).join(" ");
          return (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${detailClasses}`}>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">{feature.icon}</span>
                <span>{feature.title}</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Quick Reference Section
export const QuickReferenceSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        ⚡ Quick Reference
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-3">📊 What You'll See</h3>
          <ul className="text-sm space-y-2">
            <li>• 8 Infrastructure category cards with totals</li>
            <li>• User statistics (total, active users)</li>
            <li>• Tool usage breakdown by type</li>
            <li>• API performance metrics & charts</li>
            <li>• Usage trends over time</li>
            <li>• System health indicators</li>
            <li>• Recent activity feed (last 10)</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-3">🎯 How to Use</h3>
          <ul className="text-sm space-y-2">
            <li>• Enable auto-refresh for live updates</li>
            <li>• Select time ranges for charts (1h-90d)</li>
            <li>• Hover over charts for detailed values</li>
            <li>• Monitor system health badges</li>
            <li>• Watch recent activity in real-time</li>
            <li>• Use manual refresh for instant updates</li>
            <li>• Toggle dark mode for comfort</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Data Refresh Section
export const DataRefreshSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🔄 Data Refresh Options
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white bg-opacity-10 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-3">⚙️ Auto-Refresh</h3>
          <ul className="text-sm space-y-2">
            <li>• Toggle ON/OFF in header</li>
            <li>• Updates every 60 seconds</li>
            <li>• All sections refresh automatically</li>
            <li>• Icon shows: 🔄 (ON) or ⏸️ (OFF)</li>
            <li>• Recommended for monitoring</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-3">🔄 Manual Refresh</h3>
          <ul className="text-sm space-y-2">
            <li>• Click refresh button anytime</li>
            <li>• Instant data update</li>
            <li>• Works with auto-refresh OFF</li>
            <li>• Shows loading spinner</li>
            <li>• Updates timestamp display</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

