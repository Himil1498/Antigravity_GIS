import React from 'react';
import { proTips, useCases } from '../data/index';

// Key Features Section
export const KeyFeaturesSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">✨ Key Features</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">📊 Comprehensive View</h3>
          <ul className="text-sm space-y-1">
            <li>• ALL GIS data in one place</li>
            <li>• 8 data types supported</li>
            <li>• Live count statistics</li>
            <li>• Tab-based navigation</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">🔍 Advanced Filtering</h3>
          <ul className="text-sm space-y-1">
            <li>• Multi-level filter system</li>
            <li>• Real-time search across fields</li>
            <li>• Category & company filters</li>
            <li>• Ownership toggles</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">📥 Export Options</h3>
          <ul className="text-sm space-y-1">
            <li>• 4 formats: KML, CSV, Excel, PDF</li>
            <li>• Single item export</li>
            <li>• Bulk export by category</li>
            <li>• Respects active filters</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">💾 Storage Management</h3>
          <ul className="text-sm space-y-1">
            <li>• Permanent (My Data in-app)</li>
            <li>• Temporary (session-only)</li>
            <li>• Convert temp to permanent</li>
            <li>• Expiry warnings & tracking</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">🔐 Access Control</h3>
          <ul className="text-sm space-y-1">
            <li>• Role-based permissions</li>
            <li>• User filter (where permitted)</li>
            <li>• Your Data vs Others Data</li>
            <li>• Edit/Delete permissions</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">🔄 Live Updates</h3>
          <ul className="text-sm space-y-1">
            <li>• Live updates keep the UI fresh</li>
            <li>• Changes appear in lists and stats</li>
            <li>• No page reload needed for updates</li>
            <li>• Keeps everyone in sync</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// System Integration Section
export const SystemIntegrationSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-teal-600 to-green-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">🔗 System Integration</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            <span>Map Integration</span>
          </h3>
          <ul className="text-sm space-y-1">
            <li>• View on Map button</li>
            <li>• Centers map on item location</li>
            <li>• Interactive markers with InfoWindows</li>
            <li>• Layer visibility toggle</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">🛠️</span>
            <span>GIS Tools</span>
          </h3>
          <ul className="text-sm space-y-1">
            <li>• Edit opens corresponding tool</li>
            <li>• Data loaded automatically</li>
            <li>• Save → View in Data Hub link</li>
            <li>• Seamless tool integration</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span>Dashboard</span>
          </h3>
          <ul className="text-sm space-y-1">
            <li>• Statistics sync with KPI cards</li>
            <li>• View All Data button</li>
            <li>• Live count updates</li>
            <li>• Analytics integration</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            <span>Search System</span>
          </h3>
          <ul className="text-sm space-y-1">
            <li>• Global search integration</li>
            <li>• Search by name, type, ID</li>
            <li>• Jump to specific item</li>
            <li>• Quick navigation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Use Cases Section
export const UseCasesSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
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
    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-8 mt-8 text-white">
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

// Performance Features Section
export const PerformanceFeaturesSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mt-8 mb-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">⚡ Performance & Optimization</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span>Lazy Loading</span>
          </h3>
          <ul className="text-sm space-y-1">
            <li>• Data loads on-demand by tab</li>
            <li>• Only active tab data fetched</li>
            <li>• Reduces initial load time</li>
            <li>• Improves performance</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">🧮</span>
            <span>useMemo Optimization</span>
          </h3>
          <ul className="text-sm space-y-1">
            <li>• Filtered data cached</li>
            <li>• Re-computation only when needed</li>
            <li>• Smooth UI interactions</li>
            <li>• Efficient filter handling</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">🔄</span>
            <span>Live Updates</span>
          </h3>
          <ul className="text-sm space-y-1">
            <li>• Live sync keeps UI fresh</li>
            <li>• No polling overhead for users</li>
            <li>• Instant change propagation in the interface</li>
            <li>• All permitted users see updates</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span className="text-2xl">💾</span>
            <span>Client-Side Export</span>
          </h3>
          <ul className="text-sm space-y-1">
            <li>• Fast file generation in browser</li>
            <li>• Instant downloads</li>
            <li>• Reduced backend work</li>
            <li>• Better user experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

