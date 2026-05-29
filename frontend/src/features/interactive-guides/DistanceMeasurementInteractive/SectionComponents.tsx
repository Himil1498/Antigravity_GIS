import React, { useState } from 'react';
import { steps, storageComparison } from './data';
import FlowStepCard from './FlowStepCard';

// Header Component
const GuideHeader: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="text-center">
        <div className="text-6xl mb-4">📏</div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          Distance Measurement Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Simple Step-by-Step Guide
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

// Storage Comparison Component
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
              <th className="text-left p-4 text-gray-600 dark:text-gray-400">
                Feature
              </th>
              <th className="text-left p-4 text-blue-600 dark:text-blue-400">
                🔒 Permanent
              </th>
              <th className="text-left p-4 text-yellow-600 dark:text-yellow-400">
                ⏰ Temporary
              </th>
            </tr>
          </thead>
          <tbody>
            {storageComparison.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 dark:border-gray-700"
              >
                <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                  {row.feature}
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">
                  {row.permanent}
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">
                  {row.temporary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Quick Access Guide Component
const QuickAccessGuide: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        🔍 Where to Find Your Saved Data
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg">
          <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
            📊 GIS Data Hub
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Navigate to Data Hub → My Data tab → Distance Measurements section
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg">
          <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
            🗺️ Map Layers
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            On Map page → Click Layers → Toggle Distance Measurements ON
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg">
          <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-2">
            📂 Load in Tool
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Open Distance Tool → Click Load Saved → Select measurement
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-4 rounded-lg">
          <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-2">
            📤 Export Data
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Data Hub → Export → Choose format (KML/CSV/Excel/PDF)
          </p>
        </div>
      </div>
    </div>
  );
};

// Tech Stack Component
const TechStackSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl shadow-xl p-6 mt-8 text-white">
      <div className="grid md:grid-cols-1 gap-4 text-center">
        <div>
          <p className="text-gray-400 text-sm mb-1">Frontend</p>
          <p className="font-bold">React + Google Maps</p>
          <p className="text-sm text-gray-300">
            Component: DistanceMeasurementFlow
          </p>
        </div>
      </div>
    </div>
  );
};

// Export all components
export { GuideHeader, FlowSteps, StorageComparisonSection, QuickAccessGuide, TechStackSection };

