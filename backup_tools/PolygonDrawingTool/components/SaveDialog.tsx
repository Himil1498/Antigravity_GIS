/**
 * Save Dialog Component
 * Allows user to enter name, description, and storage type for the polygon
 */

import React, { useState } from "react";
import StorageTypeSelector from "../../../../../components/ui/StorageTypeSelector";

interface SaveDialogProps {
  isOpen: boolean;
  saving: boolean;
  onSave: (name: string, description: string, storageType: 'permanent' | 'temporary') => void;
  onCancel: () => void;
}

const SaveDialog: React.FC<SaveDialogProps> = ({
  isOpen,
  saving,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [storageType, setStorageType] = useState<'permanent' | 'temporary'>('permanent');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(name, description, storageType);
    // Reset form
    setName("");
    setDescription("");
    setStorageType('permanent');
  };

  const handleCancel = () => {
    onCancel();
    // Reset form
    setName("");
    setDescription("");
    setStorageType('permanent');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Save Polygon
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter polygon name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Storage Type Selection */}
          <StorageTypeSelector
            storageType={storageType}
            onStorageTypeChange={setStorageType}
          />
        </div>
        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;

