import React from 'react';
import { dataTypes, exportFormats, infrastructureCategories, customerCompanies, accessMethods, storageComparison } from '../data/index';
import { getColorClasses } from '../utils';

// Data Types Section
export const DataTypesSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        📑 8 Data Types Supported
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {dataTypes.map((type, idx) => {
          const detailClasses = getColorClasses(type.color).split(' ').slice(2).join(' ');
          return (
            <div key={idx} className={`flex items-start gap-3 p-4 rounded-lg border-l-4 ${detailClasses}`}>
              <span className="text-2xl">{type.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{type.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{type.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Export Formats Section
export const ExportFormatsSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">📥 4 Export Formats</h2>
      <div className="grid md:grid-cols-4 gap-4">
        {exportFormats.map((format, idx) => (
          <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
            <div className="text-3xl mb-2">{format.icon}</div>
            <p className="font-bold">{format.name}</p>
            <p className="text-xs mt-1">{format.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Infrastructure Categories Section
export const InfrastructureCategoriesSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        🏗️ Infrastructure Categories (8 Types)
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {infrastructureCategories.map((cat, idx) => (
          <div key={idx} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <span className="text-2xl">{cat.icon}</span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{cat.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{cat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Customer Companies Section
export const CustomerCompaniesSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl shadow-xl p-8 mt-8 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">👥 Customer Companies (5 Options)</h2>
      <div className="grid md:grid-cols-5 gap-4">
        {customerCompanies.map((company, idx) => (
          <div key={idx} className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
            <div className="text-3xl mb-2">{company.icon}</div>
            <p className="font-bold">{company.name}</p>
            <p className="text-xs mt-1">{company.full}</p>
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
              <th className="text-left p-4 text-gray-600 dark:text-gray-400">Feature</th>
              <th className="text-left p-4 text-green-600 dark:text-green-400">🗄️ Permanent</th>
              <th className="text-left p-4 text-yellow-600 dark:text-yellow-400">⏱️ Temporary</th>
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
export const AccessMethodsSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        🚀 Ways to Access GIS Data Hub
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {accessMethods.map((method, idx) => {
          const detailClasses = getColorClasses(method.color).split(' ').slice(2).join(' ');
          return (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${detailClasses}`}>
              <h3 className="font-bold mb-2 text-gray-800 dark:text-gray-200">
                {method.number} {method.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{method.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

