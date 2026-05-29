/**
 * Technical Details Form Component
 * RF-specific fields (tower name, frequency, technology, etc.)
 */

import React from 'react';
import EnhancedSelect from '../../../../../components/ui/EnhancedSelect';
import type { TechnologyType, SectorStatus } from '../types/sectorTypes';

interface TechnicalDetailsFormProps {
  showAdvancedOptions: boolean;
  onToggle: () => void;
  towerName: string;
  sectorName: string;
  frequency: string;
  technology: TechnologyType;
  antennaHeight: string;
  status: SectorStatus;
  onTowerNameChange: (value: string) => void;
  onSectorNameChange: (value: string) => void;
  onFrequencyChange: (value: string) => void;
  onTechnologyChange: (value: TechnologyType) => void;
  onAntennaHeightChange: (value: string) => void;
  onStatusChange: (value: SectorStatus) => void;
}

const TechnicalDetailsForm: React.FC<TechnicalDetailsFormProps> = ({
  showAdvancedOptions,
  onToggle,
  towerName,
  sectorName,
  frequency,
  technology,
  antennaHeight,
  status,
  onTowerNameChange,
  onSectorNameChange,
  onFrequencyChange,
  onTechnologyChange,
  onAntennaHeightChange,
  onStatusChange
}) => {
  return (
    <>
      {/* Advanced Options Toggle */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium flex items-center justify-between"
      >
        <span>RF Technical Details (Optional)</span>
        <svg
          className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Advanced Options */}
      {showAdvancedOptions && (
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tower Name
            </label>
            <input
              type="text"
              value={towerName}
              onChange={(e) => onTowerNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="e.g., Tower-MH-001"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sector Name
            </label>
            <input
              type="text"
              value={sectorName}
              onChange={(e) => onSectorNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="e.g., Alpha, Sector-A"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency (MHz)
              </label>
              <input
                type="number"
                value={frequency}
                onChange={(e) => onFrequencyChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="e.g., 2100"
              />
            </div>

            <div>
              <EnhancedSelect
                label="Technology"
                value={technology}
                onChange={(value) => onTechnologyChange(value as TechnologyType)}
                options={[
                  { value: '2G', label: '2G', description: 'GSM Technology' },
                  { value: '3G', label: '3G', description: 'UMTS/HSPA' },
                  { value: '4G', label: '4G', description: 'LTE/LTE-A' },
                  { value: '5G', label: '5G', description: 'New Radio' },
                  { value: 'Wi-Fi', label: 'Wi-Fi', description: 'Wireless LAN' },
                  { value: 'Other', label: 'Other', description: 'Other technology' }
                ]}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Antenna Height (m)
              </label>
              <input
                type="number"
                value={antennaHeight}
                onChange={(e) => onAntennaHeightChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="e.g., 30"
              />
            </div>

            <div>
              <EnhancedSelect
                label="Status"
                value={status}
                onChange={(value) => onStatusChange(value as SectorStatus)}
                options={[
                  {
                    value: 'Active',
                    label: 'Active',
                    icon: (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ),
                    description: 'Currently operational'
                  },
                  {
                    value: 'Inactive',
                    label: 'Inactive',
                    icon: (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ),
                    description: 'Not in service'
                  },
                  {
                    value: 'Planned',
                    label: 'Planned',
                    icon: (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    ),
                    description: 'Future deployment'
                  },
                  {
                    value: 'Testing',
                    label: 'Testing',
                    icon: (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                    ),
                    description: 'In testing phase'
                  }
                ]}
                className="text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TechnicalDetailsForm;

