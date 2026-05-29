import React from 'react';
import { visualElements, storageComparison, accessMethods } from '../uiData';
import { getColorClasses } from '../utils';

// Visual Elements Section
export const VisualElementsSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        👁️ Visual Elements on Map
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {visualElements.map((element, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
          >
            <span className="text-2xl">{element.icon}</span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {element.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {element.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Storage Comparison Section
export const StorageComparisonSection: React.FC = () => {
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

// Access Methods Section
export const AccessMethodsSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        🔍 Where to Access Saved Circles (6 Ways)
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {accessMethods.map((method, idx) => {
          const colorClasses = getColorClasses(method.color);
          const bgClasses = colorClasses.split(" ").slice(2, 4).join(" ");
          const textClasses = colorClasses.split(" ").slice(4).join(" ");
          return (
            <div
              key={idx}
              className={`bg-gradient-to-br ${bgClasses} p-4 rounded-lg`}
            >
              <h3 className={`font-bold mb-2 ${textClasses}`}>
                {method.number} {method.title}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {method.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

