import React from "react";
import StorageTypeSelector from "../../../../../components/ui/StorageTypeSelector";

interface SaveCircleDialogProps {
  isOpen: boolean;
  name: string;
  onNameChange: (name: string) => void;
  description: string;
  onDescriptionChange: (desc: string) => void;
  storageType: "permanent" | "temporary";
  onStorageTypeChange: (type: "permanent" | "temporary") => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}

const SaveCircleDialog: React.FC<SaveCircleDialogProps> = ({
  isOpen,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  storageType,
  onStorageTypeChange,
  onCancel,
  onSave,
  saving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Save Circle
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter circle name"
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
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <StorageTypeSelector
            storageType={storageType}
            onStorageTypeChange={onStorageTypeChange}
          />
        </div>
        <div className="flex space-x-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
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

export default SaveCircleDialog;

