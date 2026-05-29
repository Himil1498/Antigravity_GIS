import React from 'react';

// Quick Flow Summary Section
export const QuickFlowSummary: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-xl p-6 mt-8 text-white">
      <h2 className="text-xl font-bold mb-4 text-center">
        ⚡ Quick Flow Summary
      </h2>
      <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6">
        <div className="space-y-3 text-sm">
          <p>
            1️⃣ Open Tool → 2️⃣ Click center (circle appears) → 3️⃣ View
            elements (handles, info)
          </p>
          <p>
            4️⃣ Adjust radius (input/drag/slider) → 5️⃣ Move circle (drag to
            relocate)
          </p>
          <p>
            6️⃣ Customize (color & opacity) → 7️⃣ Reset or Clear if needed
          </p>
          <p>
            8️⃣ Save (Permanent/Temporary) → 9️⃣ Data stored in selected app
            storage → 🔟 Access anytime! 🎉
          </p>
          <div className="border-t border-orange-400 pt-3 mt-3">
            <p className="text-orange-100">
              📊 Calculations: Area = π×r², Perimeter = 2×π×r (auto-updated)
            </p>
            <p className="text-orange-100">
              📂 Access via: Data Hub | Map Layers | Load Button | Search |
              Export
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Technical Details Section
export const TechStackSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl shadow-xl p-6 mt-8 text-white">
      <h2 className="text-xl font-bold mb-4 text-center">
        ⚙️ Technical Details
      </h2>
      <div className="grid md:grid-cols-1 gap-4 text-center">
        <div>
          <p className="text-gray-400 text-sm mb-1">Frontend</p>
          <p className="font-bold">React + Google Maps</p>
          <p className="text-sm text-gray-300">Port 3005</p>
          <p className="text-xs text-gray-400 mt-1">
            CircleDrawingTool.tsx
          </p>
        </div>
      </div>
    </div>
  );
};

// Key Features Section
export const KeyFeaturesSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-orange-600 to-pink-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        ✨ Key Features
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">📏 Flexible Radius Control</h3>
          <ul className="text-sm space-y-1">
            <li>• Type exact value (meters)</li>
            <li>• Drag resize handles visually</li>
            <li>• Use slider (100m - 50km)</li>
            <li>• Real-time area/perimeter updates</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">🎨 Visual Customization</h3>
          <ul className="text-sm space-y-1">
            <li>• RGB/Hex color picker</li>
            <li>• Opacity slider (0-100%)</li>
            <li>• Real-time preview</li>
            <li>• Custom styling for use cases</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">↔️ Interactive Controls</h3>
          <ul className="text-sm space-y-1">
            <li>• Drag to move entire circle</li>
            <li>• 4 resize handles (N, S, E, W)</li>
            <li>• Boundary validation (India)</li>
            <li>• Reset to default radius</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">💾 Flexible Storage</h3>
          <ul className="text-sm space-y-1">
            <li>• Save to My Data (persistent in-app)</li>
            <li>• Temporary session cache</li>
            <li>• Multi-format export</li>
            <li>• Cross-device access (app-dependent)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Use Cases Section
export const UseCasesSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mt-8 mb-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🎯 Common Use Cases
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">📡 Telecom Planning</h3>
          <p className="text-sm">
            Coverage zones, signal range, interference analysis
          </p>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">🚨 Emergency Services</h3>
          <p className="text-sm">
            Response zones, danger areas, evacuation radii
          </p>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">🏢 Business Analysis</h3>
          <p className="text-sm">
            Service areas, delivery zones, market reach
          </p>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">🌳 Environmental Studies</h3>
          <p className="text-sm">
            Impact zones, buffer areas, protected regions
          </p>
        </div>
      </div>
    </div>
  );
};

