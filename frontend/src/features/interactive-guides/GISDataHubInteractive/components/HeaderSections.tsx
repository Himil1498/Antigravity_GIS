import React, { useState } from 'react';
import { steps } from '../data/index';
import FlowStepCard from './FlowStepCard';

// Header Component
export const GuideHeader: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="text-center">
        <div className="text-6xl mb-4">📊</div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          GIS Data Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Complete Interactive Guide - Central Data Management for All GIS Tools
        </p>
      </div>
    </div>
  );
};

// Quick Overview Component
export const QuickOverview: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">🎯 What is GIS Data Hub?</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Purpose</h3>
          <ul className="text-sm space-y-1">
            <li>✓ Centralized view of GIS data</li>
            <li>✓ Access data from multiple GIS tools</li>
            <li>✓ Manage infrastructure items</li>
            <li>✓ Export in multiple formats</li>
            <li>✓ Convert temporary to permanent</li>
          </ul>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Key Features</h3>
          <ul className="text-sm space-y-1">
            <li>✓ 8 data types supported</li>
            <li>✓ Multi-level filtering system</li>
            <li>✓ 4 export formats (KML/CSV/Excel/PDF)</li>
            <li>✓ Live statistics</li>
            <li>✓ Permission-based access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Flow Steps Component
export const FlowSteps: React.FC = () => {
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

// Quick Flow Summary Component
export const QuickFlowSummary: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 mt-8 text-white">
      <h2 className="text-xl font-bold mb-4 text-center">⚡ Quick Flow Summary</h2>
      <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6">
        <div className="space-y-3 text-sm">
          <p>1️⃣ Access Data Hub → 2️⃣ Select Tab → 3️⃣ Choose User Filter (if permitted)</p>
          <p>4️⃣ Apply Filters → 5️⃣ View Data Table → 6️⃣ View Details → 7️⃣ Edit/Delete (where permitted)</p>
          <p>8️⃣ Export Single or Bulk → 9️⃣ Manage Temporary Data → 🔟 Monitor Statistics</p>
          <div className="border-t border-purple-400 pt-3 mt-3">
            <p className="text-purple-100">📊 Live statistics | 🔐 Role-based access | 💾 Permanent & Temporary storage options</p>
            <p className="text-purple-100">📥 Export: KML, CSV, Excel, PDF | 🗺️ Integrated with Map, Dashboard, GIS Tools</p>
          </div>
        </div>
      </div>
    </div>
  );
};

