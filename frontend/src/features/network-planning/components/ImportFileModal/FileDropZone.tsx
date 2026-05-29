import React from "react";

interface FileDropZoneProps {
  isDragging: boolean;
  uploading: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  isDragging,
  uploading,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  fileInputRef,
  onFileSelect,
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={`
      relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-300
      ${
        isDragging
          ? "border-blue-500 bg-blue-50/80 dark:bg-blue-900/40 scale-[1.01] shadow-lg"
          : "border-indigo-200 dark:border-gray-600 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-gray-800/50 hover:border-blue-400 hover:bg-white dark:hover:bg-gray-700/50 hover:shadow-md"
      }
      backdrop-blur-sm
    `}
    >
      <input
        type="file"
        multiple
        accept=".kml,.kmz"
        className="hidden"
        ref={fileInputRef}
        onChange={onFileSelect}
      />

      {uploading ? (
        <div className="flex flex-col items-center py-3">
          <div className="relative h-10 w-10 mb-3">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-blue-600 dark:text-blue-400 font-bold text-base animate-pulse">
            Processing GIS Data...
          </p>
          <p className="text-xs text-slate-500 mt-1">Please wait a moment</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className={`h-10 w-10 mb-2 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
            isDragging ? 'bg-blue-500 text-white scale-110' : 'bg-blue-50 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400'
          }`}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="text-slate-800 dark:text-slate-100 font-bold text-base mb-0.5">
            {isDragging ? "Drop to Begin Import" : "Import Network Inventory"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Drag and drop your <span className="text-indigo-600 dark:text-indigo-400 font-bold">KML/KMZ</span> files here
          </p>
          <div className="mt-2 px-3 py-1 bg-white/80 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-full text-[11px] font-bold text-slate-500 shadow-sm">
            Maximum efficiency for large GIS datasets
          </div>
        </div>
      )}
    </div>
  );
};

