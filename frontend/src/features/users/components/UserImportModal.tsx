import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useUserImportExport } from "../hooks/useUserImportExport";

interface UserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (users: any[]) => Promise<void>;
  isLoading?: boolean;
}

const UserImportModal: React.FC<UserImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isLoading = false,
}) => {
  const { handleImportTemplate } = useUserImportExport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setParsedData([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          setError("The file appears to be empty.");
          return;
        }

        // Validate headers (support both old and new template)
        const firstRow = data[0] as any;
        const hasEmail = firstRow['Email ID'] || firstRow['Email'];
        const hasName = firstRow['Full Name'];
        if (!hasEmail && !hasName) {
           setError("Invalid format. Please download and use the template.");
           return;
        }

        setParsedData(data);
      } catch (err) {
        setError("Failed to parse Excel file.");
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleClearFile = () => {
    setParsedData([]);
    setFileName(null);
    setError(null);
    setImportProgress({ current: 0, total: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportClick = async () => {
    if (parsedData.length === 0) return;
    setImporting(true);
    setImportProgress({ current: 0, total: parsedData.length });

    try {
      await onImport(parsedData);
      // Clear state after successful import
      handleClearFile();
    } catch (err) {
      setError("Import failed. Please check the console for details.");
    } finally {
      setImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  // All template columns for preview
  const previewColumns = [
    { key: 'User Name', alt: 'Username', label: 'User Name' },
    { key: 'Full Name', alt: null, label: 'Full Name' },
    { key: 'Email ID', alt: 'Email', label: 'Email ID' },
    { key: 'Password', alt: null, label: 'Password' },
    { key: 'Mobile Number', alt: 'Phone Number', label: 'Mobile' },
    { key: 'Gender', alt: null, label: 'Gender' },
    { key: 'Street Address', alt: 'Street', label: 'Street' },
    { key: 'City', alt: null, label: 'City' },
    { key: 'State', alt: null, label: 'State' },
    { key: 'Pincode', alt: null, label: 'Pincode' },
    { key: 'Department', alt: null, label: 'Dept' },
    { key: 'Role', alt: null, label: 'Role' },
    { key: 'Office Location', alt: null, label: 'Office' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={importing ? undefined : onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Import Users
            </h3>

            <div className="space-y-6">
              {/* Step 1: Download Template */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Step 1: Get the Template
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Download the Excel template to ensure correct formatting. Fill all required fields.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleImportTemplate}
                  className="px-3 py-2 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shrink-0"
                >
                  Download Template
                </button>
              </div>

              {/* Step 2: Upload File */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                  className="hidden"
                />

                {!fileName ? (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-medium text-violet-600 hover:text-violet-500 focus:outline-none focus:underline"
                      >
                        Upload a file
                      </button>
                      <span className="pl-1">or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Excel files (.xlsx) only
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {fileName}
                    </span>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      disabled={importing}
                      className="ml-2 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40"
                    >
                      ✕ Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={importing}
                      className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/40"
                    >
                      Change File
                    </button>
                  </div>
                )}

                {error && (
                   <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">
                     ⚠ {error}
                   </p>
                )}
              </div>

              {/* Step 3: Preview - Show ALL details */}
              {parsedData.length > 0 && (
                <div>
                   <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Preview ({parsedData.length} user{parsedData.length > 1 ? 's' : ''} found)
                   </h4>
                   <div className="max-h-72 overflow-auto border border-gray-200 dark:border-gray-700 rounded-md">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">#</th>
                            {previewColumns.map((col) => (
                              <th
                                key={col.key}
                                className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap"
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {parsedData.slice(0, 100).map((row, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-750'}>
                              <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-400">{idx + 1}</td>
                              {previewColumns.map((col) => {
                                let value = row[col.key] || (col.alt ? row[col.alt] : '') || '';
                                // Mask password
                                if (col.key === 'Password' && value) {
                                  value = '••••••';
                                }
                                return (
                                  <td
                                    key={col.key}
                                    className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300 max-w-[160px] truncate"
                                    title={String(value)}
                                  >
                                    {String(value) || '-'}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsedData.length > 100 && (
                        <div className="p-2 text-center text-xs text-gray-500 bg-gray-50 dark:bg-gray-700">
                          And {parsedData.length - 100} more...
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Import / Cancel buttons */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={importing || parsedData.length === 0}
              onClick={handleImportClick}
              className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-violet-600 text-base font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing... Please wait
                </>
              ) : (
                `Import ${parsedData.length} User${parsedData.length > 1 ? 's' : ''}`
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                handleClearFile();
                onClose();
              }}
              disabled={importing}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserImportModal;
