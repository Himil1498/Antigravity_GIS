/**
 * Format Selection Component
 * Allows users to select the format for the exported report (CSV, XLSX, JSON)
 */

import React from 'react';

type ExportFormat = 'csv' | 'json' | 'xlsx';

interface FormatSelectionProps {
  selectedFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
}

const FormatSelection: React.FC<FormatSelectionProps> = ({
  selectedFormat,
  onFormatChange
}) => {
  return (
    <div className="bg-gradient-to-br from-emerald-50/50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20 rounded-xl shadow-lg border-2 border-emerald-100 dark:border-emerald-900/30 p-6">
      <div className="flex items-center mb-5">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mr-3 shadow-md">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent">
          Select Format
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
          selectedFormat === 'csv' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
        }`}>
          <input
            type="radio"
            name="format"
            value="csv"
            checked={selectedFormat === 'csv'}
            onChange={() => onFormatChange('csv')}
            className="mr-3 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600"
          />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">CSV</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Comma-separated values
            </div>
          </div>
        </label>

        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
          selectedFormat === 'xlsx' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
        }`}>
          <input
            type="radio"
            name="format"
            value="xlsx"
            checked={selectedFormat === 'xlsx'}
            onChange={() => onFormatChange('xlsx')}
            className="mr-3 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600"
          />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">XLSX</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Excel format (recommended)
            </div>
          </div>
        </label>

        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
          selectedFormat === 'json' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
        }`}>
          <input
            type="radio"
            name="format"
            value="json"
            checked={selectedFormat === 'json'}
            onChange={() => onFormatChange('json')}
            className="mr-3 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600"
          />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">JSON</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Structured data format
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default FormatSelection;

