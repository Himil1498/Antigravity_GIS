import React, { useState } from 'react';
import { apiService } from '../../../../services/api/index';
import { showToast } from '../../../../utils/toastUtils';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

const ImportDataModal: React.FC<ImportDataModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [selectedType, setSelectedType] = useState<string>('distance');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/datahub/template/${selectedType}`, {
         responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `template_${selectedType}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("Template download failed", e);
      showToast.error("Failed to download template. Ensure you have permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      showToast.warning("Please select a file to import");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);
      
      const response = await apiService.post('/datahub/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response && response.data && response.data.success) {
        showToast.success(`Successfully imported ${response.data.importedCount} records.`);
        onImportSuccess();
        onClose();
        setFile(null); // Reset form
      } else {
         showToast.error("Import failed for unknown reasons");
      }
    } catch (error: any) {
      console.error("Import failed:", error);
      showToast.error(error.response?.data?.error || "Failed to import file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Bulk Import Data
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-white dark:text-gray-400 hover:bg-red-500 rounded-lg transition-all duration-300 group shadow-sm"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Data Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Data Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="distance">Distance Measurements</option>
              <option value="polygon">Polygon Areas</option>
              <option value="circle">Circular Regions</option>
              <option value="sector">Sector RF Data</option>
              <option value="elevation">Elevation Profiles</option>
            </select>
          </div>

          {/* Template Download Guide */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
             <div className="flex items-start gap-3">
               <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <div>
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Format Guide</h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 mb-2">
                     Your CSV or Excel file must exactly match the database schema. Download our template filled with sample data to ensure your upload doesn't fail.
                  </p>
                  <button 
                    onClick={handleDownloadTemplate}
                    className="text-xs font-semibold text-blue-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 border border-blue-200 dark:border-gray-600"
                  >
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     Download Template (.xlsx)
                  </button>
               </div>
             </div>
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-700/50">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".csv, .xlsx"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  CSV or XLSX up to 10MB
                </p>
                {file && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                       Selected: {file.name}
                    </p>
                    <button 
                       type="button" 
                       onClick={(e) => { e.preventDefault(); setFile(null); }} 
                       className="text-gray-400 hover:text-red-500 transition-colors bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full p-1 shadow-sm"
                       aria-label="Remove selected file"
                    >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Importing...
              </>
            ) : (
              'Start Import'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDataModal;
