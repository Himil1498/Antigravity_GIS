import React from "react";

interface ImportGeoJSONDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  importPreview: any;
  importedFile: File | null;
  setImportedFile: (file: File | null) => void;
  setImportPreview: (preview: any) => void;
}

export const ImportGeoJSONDialog: React.FC<ImportGeoJSONDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  importPreview,
  importedFile,
  setImportedFile,
  setImportPreview,
}) => {
  if (!isOpen || !importPreview) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-purple-600 dark:from-purple-700 to-purple-700 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 bg-opacity-20 rounded-xl">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Import GeoJSON Boundary
              </h3>
              <p className="text-purple-100 text-sm mt-1">
                Review and confirm the imported boundary data
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-purple-600"
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
              <div>
                <p className="font-semibold text-purple-900">
                  {importedFile?.name}
                </p>
                <p className="text-sm text-purple-700">
                  {(importedFile?.size ? importedFile.size / 1024 : 0).toFixed(2)} KB
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Geometry Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Type
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {importPreview.type}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Vertex Count
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {importPreview.type === "Polygon"
                    ? importPreview.coordinates[0]?.length || 0
                    : importPreview.coordinates?.reduce(
                        (sum: number, polygon: any) =>
                          sum + (polygon[0]?.length || 0),
                        0
                      ) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 rounded-xl p-4 flex gap-3">
            <svg
              className="w-6 h-6 text-yellow-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-semibold text-yellow-900">
                Importing will replace current boundary
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                The imported geometry will replace the current boundary in the
                editor. You will need to save the changes to create a draft.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose();
                setImportedFile(null);
                setImportPreview(null);
              }}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 dark:from-purple-700 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              Confirm & Load into Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

