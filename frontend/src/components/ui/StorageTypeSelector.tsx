import React from 'react';

interface StorageTypeSelectorProps {
  storageType: 'permanent' | 'temporary';
  onStorageTypeChange: (type: 'permanent' | 'temporary') => void;
}

/**
 * Reusable Storage Type Selector Component
 * Used across all GIS tools for consistent UI
 */
const StorageTypeSelector: React.FC<StorageTypeSelectorProps> = ({
  storageType,
  onStorageTypeChange
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Storage Type
      </label>
      <div className="space-y-3">
        {/* Permanent Option */}
        <label className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
          storageType === 'permanent'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}>
          <input
            type="radio"
            name="storageType"
            value="permanent"
            checked={storageType === 'permanent'}
            onChange={() => onStorageTypeChange('permanent')}
            className="mt-1 w-4 h-4 text-blue-600"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 dark:text-white">Permanent (Database)</span>
              <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">♾️ Forever</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Saved to database, accessible from any device
            </p>
          </div>
        </label>

        {/* Temporary Option */}
        <label className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
          storageType === 'temporary'
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}>
          <input
            type="radio"
            name="storageType"
            value="temporary"
            checked={storageType === 'temporary'}
            onChange={() => onStorageTypeChange('temporary')}
            className="mt-1 w-4 h-4 text-orange-600"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 dark:text-white">Temporary (Local)</span>
              <span className="ml-2 text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full">🕐 24h</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Saved locally, only on this device
            </p>
            {storageType === 'temporary' && (
              <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded flex items-start">
                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-xs text-orange-700 dark:text-orange-300">
                  <strong>WARNING:</strong> This data will be automatically deleted:
                  <ul className="list-disc ml-4 mt-1">
                    <li>When you logout</li>
                    <li>After 24 hours (even if logged in)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
};

export default StorageTypeSelector;

