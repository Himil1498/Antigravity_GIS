import React, { useState } from 'react';
import { steps, visualElements, storageComparison, accessMethods } from './data';
import { getColorClasses } from './utils';
import FlowStepCard from './FlowStepCard';

// Header Component
const GuideHeader: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="text-center">
        <div className="text-6xl mb-4">📈</div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          Elevation Profile Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Complete Step-by-Step Guide from Profiling to 3D View & LOS Analysis
        </p>
      </div>
    </div>
  );
};

// Flow Steps Component
const FlowSteps: React.FC = () => {
  const [showDetails, setShowDetails] = useState<number | null>(null);

  const handleToggle = (stepId: number) => {
    setShowDetails(showDetails === stepId ? null : stepId);
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <FlowStepCard
          key={step.id}
          step={step}
          isExpanded={showDetails === step.id}
          onToggle={() => handleToggle(step.id)}
          isLast={index === steps.length - 1}
        />
      ))}
    </div>
  );
};

// Visual Elements Section
const VisualElementsSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        👁️ Visual Elements on Map
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {visualElements.map((element, idx) => (
          <div key={idx} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <span className="text-2xl">{element.icon}</span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{element.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{element.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Storage Comparison Section
const StorageComparisonSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        💾 Storage Options Comparison
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left p-4 text-gray-600 dark:text-gray-400">Feature</th>
              <th className="text-left p-4 text-blue-600 dark:text-blue-400">🔒 Permanent</th>
              <th className="text-left p-4 text-yellow-600 dark:text-yellow-400">⏰ Temporary</th>
            </tr>
          </thead>
          <tbody>
            {storageComparison.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">{row.feature}</td>
                <td className="p-4 text-gray-600 dark:text-gray-400">{row.permanent}</td>
                <td className="p-4 text-gray-600 dark:text-gray-400">{row.temporary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Access Methods Section
const AccessMethodsSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        🔍 Where to Access Saved Profiles
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {accessMethods.map((method, idx) => {
          const colorClasses = getColorClasses(method.color);
          const bgClasses = colorClasses.split(' ').slice(2, 4).join(' ');
          const textClasses = colorClasses.split(' ').slice(4).join(' ');
          return (
            <div key={idx} className={`bg-gradient-to-br ${bgClasses} p-4 rounded-lg`}>
              <h3 className={`font-bold mb-2 ${textClasses}`}>
                {method.number} {method.title}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{method.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Quick Flow Summary Section
const QuickFlowSummary: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl shadow-xl p-6 mt-8 text-white">
      <h2 className="text-xl font-bold mb-4 text-center">⚡ Quick Flow Summary</h2>
      <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6">
        <div className="space-y-3 text-sm">
          <p>1️⃣ Open Tool → 2️⃣ Click Point A (green) → 3️⃣ Click Point B (red) → 4️⃣ View elevation graph</p>
          <p>5️⃣ View statistics & bearing → 6️⃣ Optional: Graph hover (interactive marker)</p>
          <p>7️⃣ Optional: Enable 3D View → 8️⃣ Optional: LOS Analysis</p>
          <p>9️⃣ Save profile (Permanent/Temporary) → 🔟 Access anytime! 🎉</p>
          <div className="border-t border-gray-600 pt-3 mt-3">
            <p className="text-gray-300">📊 High precision elevation data with 512 sample points</p>
            <p className="text-gray-300">📂 Access via: Data Hub | Map Layers | Load Button | Search | Export</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Key Features Section
const KeyFeaturesSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">✨ Key Features</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">📊 Real-time Analysis</h3>
          <ul className="text-sm space-y-1">
            <li>• 512 elevation samples</li>
            <li>• Distance & bearing calculation</li>
            <li>• Elevation gain/loss metrics</li>
            <li>• High/low point detection</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">🎬 3D Visualization</h3>
          <ul className="text-sm space-y-1">
            <li>• Terrain elevation view</li>
            <li>• Camera tilt & rotation</li>
            <li>• Polyline overlay</li>
            <li>• Interactive controls</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">📡 LOS Analysis</h3>
          <ul className="text-sm space-y-1">
            <li>• Building obstruction detection</li>
            <li>• Fresnel zone calculation</li>
            <li>• RF frequency support</li>
            <li>• Clearance recommendations</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">💾 Flexible Storage</h3>
          <ul className="text-sm space-y-1">
            <li>• Save forever or temporarily</li>
            <li>• Access from any device</li>
            <li>• Multi-format export</li>
            <li>• Share with team members</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Export all components
export {
  GuideHeader,
  FlowSteps,
  VisualElementsSection,
  StorageComparisonSection,
  AccessMethodsSection,
  QuickFlowSummary,
  KeyFeaturesSection,
};

