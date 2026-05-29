import React, { useState, useEffect, useRef } from "react";
import { Pencil, X } from "lucide-react";

interface RenameFolderModalProps {
  isOpen: boolean;
  folder: any;
  isRenaming: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
}

export const RenameFolderModal: React.FC<RenameFolderModalProps> = ({
  isOpen,
  folder,
  isRenaming,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && folder) {
      setName(folder.name || "");
      // Auto-focus and select text
      setTimeout(() => inputRef.current?.select(), 100);
    }
  }, [isOpen, folder]);

  if (!isOpen || !folder) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === folder.name) return;
    onConfirm(trimmed);
  };

  const isUnchanged = name.trim() === folder.name || name.trim() === "";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
              <Pencil className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Rename Folder
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Current: <span className="font-medium text-gray-700 dark:text-gray-300">{folder.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-white dark:text-gray-400 hover:bg-red-500 rounded-lg transition-all duration-300 group shadow-sm"
          >
            <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Folder Name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter new folder name..."
            autoFocus
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
            disabled={isRenaming}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isRenaming}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRenaming || isUnchanged}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRenaming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Renaming...
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  Rename
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameFolderModal;
