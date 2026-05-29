import React from "react";
import { NetworkFolder, NetworkFile } from "../../types";
import IconPicker from "../Shared/IconPicker";
import { useFileImport } from "../../hooks/useFileImport";
import { FileDropZone } from "./FileDropZone";
import { FileList } from "./FileList";
import { ICON_DEFS, STATES_AND_UTS } from "../NetworkMap/MapIcons";

interface ImportFileModalProps {
  isOpen: boolean;
  folder: NetworkFolder | null;
  files: NetworkFile[];
  onClose: () => void;
  onUpload: (files: File[], iconType: string) => Promise<void>;
  onDelete: (file: NetworkFile) => void;
  onViewOnMap?: (file: NetworkFile) => void;
}

const ImportFileModal: React.FC<ImportFileModalProps> = ({
  isOpen,
  folder,
  files,
  onClose,
  onUpload,
  onDelete,
  onViewOnMap,
}) => {
  // Helper: Check if folder is System Configured (Explicit or Implicit)
  const isSystemFolder = (f: NetworkFolder | null) => {
    if (!f) return false;
    if (f.is_system) return true;
    if (f.default_icon) return true; // Explicitly configured

    // Implicit Check: Does the Name match a known Icon Key? (e.g. BSNL, JIO, TATA, POP)
    const upperName = f.name.toUpperCase().trim();
    // Check key existence
    if (ICON_DEFS[upperName]) return true;

    // Check Partial Keywords (matches backend logic & user list)
    // List: Vodaphone, Airtel, Sify, Jio, Tata, TTSL, JTM, Optimal, RCOM, RailTail, BSNL, Dark Fiber, PGCIL
    // List: POP, Sub POP, Node, BTS, Bandwidth BTS, NNI, Data Centers, Office Locations, Elevor, Indus, Ascend

    const systemKeywords = [
      "Voda",
      "Air",
      "Sify",
      "Jio",
      "Tata",
      "TTSL",
      "JTM",
      "Optimal",
      "RCOM",
      "Rail",
      "BSNL",
      "Dark",
      "PGCIL",
      "POP",
      "Node",
      "BTS",
      "Bandwidth",
      "NNI",
      "Data Center",
      "Office",
      "Infra",
      "Elevor",
      "Indus",
      "Ascend",
    ];

    // Check keyword matches
    if (
      systemKeywords.some((keyword) =>
        f.name.toLowerCase().includes(keyword.toLowerCase()),
      )
    ) {
      return true;
    }

    // Check State/UT Matches
    const upperName2 = f.name.toUpperCase().trim();
    if (STATES_AND_UTS.some((state: string) => upperName2.includes(state))) {
      // Includes to catch "Arunachal Pradesh" matching "ARUNACHAL PRADESH" exactly or partial
      return true;
    }

    return false;
  };

  const isConfigured = isSystemFolder(folder);

  const {
    isDragging,
    uploading,
    selectedIcon,
    setSelectedIcon,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
  } = useFileImport({ folder, onUpload, files });

  if (!isOpen || !folder) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto w-full h-full flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full mx-4 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Manage Files
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {folder.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white dark:text-gray-300 hover:bg-red-500 rounded-lg transition-all duration-300 group shadow-sm"
          >
            <svg
              className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Icon Picker Section */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Feature Icon
            </label>
            {!isConfigured ? (
              <IconPicker
                selectedIcon={selectedIcon}
                onSelect={setSelectedIcon}
                genericOnly={true} // Restrict to Generic Icons for custom folders
                folderName={folder.name}
              />
            ) : (
              <div className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-600 w-10 h-10 flex items-center justify-center rounded-lg">
                    {ICON_DEFS[selectedIcon.toUpperCase()] ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="w-6 h-6"
                        fill={
                          ICON_DEFS[selectedIcon.toUpperCase()]?.color
                            ? `rgb(${ICON_DEFS[selectedIcon.toUpperCase()].color?.slice(0, 3).join(",")})`
                            : "currentColor"
                        }
                      >
                        <path d={ICON_DEFS[selectedIcon.toUpperCase()].path} />
                      </svg>
                    ) : (
                      <span className="text-xl">?</span>
                    )}
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                      System Enforced
                    </span>
                    <span className="block text-xs text-gray-500 capitalize">
                      {selectedIcon}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                  Locked
                </div>
              </div>
            )}
          </div>

          <FileDropZone
            isDragging={isDragging}
            uploading={uploading}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
          />

          <FileList
            files={files}
            onDelete={onDelete}
            onViewOnMap={onViewOnMap}
          />
        </div>
      </div>
    </div>
  );
};

export default ImportFileModal;

