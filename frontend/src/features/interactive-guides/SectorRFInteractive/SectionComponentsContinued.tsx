import React from 'react';
import { getColorClasses } from './utils';
import { storageComparison, accessMethods, keyFeatures, useCases } from './uiData';

// Storage Comparison Section
export const StorageComparisonSection: React.FC = () => (
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

// Access Methods Section
export const AccessMethodsSection: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
      🔍 Where to Access Saved Sectors
    </h2>
    <div className="grid md:grid-cols-2 gap-4">
      {accessMethods.map((method, idx) => {
        const colorClasses = getColorClasses(method.color);
        const colorParts = colorClasses.split(' ');
        const bgClasses = colorParts.slice(2, 4).join(' ');
        const textClasses = colorParts.slice(4).join(' ');
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

// Quick Flow Summary Section
export const QuickFlowSummarySection: React.FC = () => (
  <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-xl p-6 mt-8 text-white">
    <h2 className="text-xl font-bold mb-4 text-center">⚡ Quick Flow Summary</h2>
    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6">
      <div className="space-y-3 text-sm">
        <p>1️⃣ Open Tool → 2️⃣ Click tower location (sector appears) → 3️⃣ View sector elements</p>
        <p>4️⃣ Adjust azimuth (0-360°) → 5️⃣ Adjust beamwidth (10-180°) → 6️⃣ Adjust radius (100m-50km)</p>
        <p>7️⃣ Customize color & opacity → 8️⃣ Add RF technical details (frequency, tech, height)</p>
        <p>9️⃣ Save sector (Permanent/Temporary) → 🔟 Access anytime from any device! 🎉</p>
        <div className="border-t border-orange-400 pt-3 mt-3">
          <p className="text-orange-100">📊 Coverage: (π × r² × beamwidth) / 360° | Arc: (2 × π × r × beamwidth) / 360°</p>
          <p className="text-orange-100">📂 Access via: Data Hub | Map Layers | Load Button | Search | Export</p>
        </div>
      </div>
    </div>
  </div>
);

// Key Features Section
export const KeyFeaturesSection: React.FC = () => (
  <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
    <h2 className="text-2xl font-bold mb-6 text-center">✨ Key Features</h2>
    <div className="grid md:grid-cols-2 gap-4">
      {keyFeatures.map((feature, idx) => (
        <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">{feature.title}</h3>
          <ul className="text-sm space-y-1">
            {feature.items.map((item, iidx) => (
              <li key={iidx}>• {item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

// Use Cases Section
export const UseCasesSection: React.FC = () => (
  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mt-8 mb-8 text-white">
    <h2 className="text-2xl font-bold mb-6 text-center">🎯 Common Use Cases</h2>
    <div className="grid md:grid-cols-2 gap-4">
      {useCases.map((useCase, idx) => (
        <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg">
          <h3 className="font-bold mb-2">{useCase.title}</h3>
          <p className="text-sm">{useCase.description}</p>
        </div>
      ))}
    </div>
  </div>
);

