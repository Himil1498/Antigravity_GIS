import IconPicker from "../Shared/IconPicker";
import { useState, useEffect } from "react";
import { RenderMapIcon } from "../../../../components/ui/RenderMapIcon";
import { getFolderIconKey } from "../NetworkMap/MapIcons";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, defaultIcon?: string) => Promise<void>;
  isLoading?: boolean;
  parentFolder?: any; // If provided, icon is inherited from parent
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  parentFolder,
}) => {
  const [folderName, setFolderName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("star");

  // Determine if we should inherit icon from parent
  const hasParent = !!parentFolder;
  const inheritedIcon = hasParent
    ? parentFolder.default_icon || getFolderIconKey({ name: parentFolder.name, default_icon: parentFolder.default_icon }) || "star"
    : "star";

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFolderName("");
      setSelectedIcon(inheritedIcon);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    await onSubmit(folderName, selectedIcon || "star");
  };

  return (
    <div className="ds-modal-overlay">
      <div className="ds-modal-content">
        <div className="ds-modal-header">
          <h3 className="ds-modal-title">
            Create New Folder
          </h3>
          <button
            onClick={onClose}
            className="ds-btn-close"
          >
            <svg
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

        <form onSubmit={handleSubmit} className="ds-modal-body">
          <div className="ds-form-group">
            <label className="ds-label">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. New Site Survey"
              className="ds-input"
              autoFocus
            />
          </div>

          <div className="ds-form-group">
            <label className="ds-label">
              Select Icon {hasParent && <span style={{ fontSize: '0.75rem', color: 'var(--ds-primary)', marginLeft: '0.5rem' }}>(Defaulting to parent: {parentFolder.name})</span>}
            </label>
            <IconPicker
              selectedIcon={selectedIcon}
              onSelect={setSelectedIcon}
              folderName={folderName}
              genericOnly={true}
            />
          </div>

          <div className="ds-flex-end">
            <button
              type="button"
              onClick={onClose}
              className="ds-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !folderName.trim()}
              className="ds-btn-primary"
            >
              {isLoading && (
                <svg
                  className="ds-spinner"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;

