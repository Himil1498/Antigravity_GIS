import React from "react";
import { FolderAccessTree } from "./FolderAccessTree";

interface PermissionFolderSectionProps {
  title: string;
  icon: string;
  folders: any[];
  assignedFolderIds: number[];
  onToggleAll: (folders: any[], checked: boolean) => void;
  onToggleSingle: (folderId: number, checked: boolean) => void;
  themeClass?: string;
}

export const PermissionFolderSection: React.FC<PermissionFolderSectionProps> = ({
  title,
  icon,
  folders,
  assignedFolderIds,
  onToggleAll,
  onToggleSingle,
  themeClass = "ds-folder-section",
}) => {
  const areFoldersSelected = (nodes: any[]) => {
    if (!nodes || nodes.length === 0) return false;
    const allIds: number[] = [];
    const collectIds = (nList: any[]) => {
      nList.forEach((n) => {
        allIds.push(n.id);
        if (n.children) collectIds(n.children);
      });
    };
    collectIds(nodes);
    return allIds.length > 0 && allIds.every((id) => assignedFolderIds.includes(id));
  };

  const allSelected = areFoldersSelected(folders);

  return (
    <div className={themeClass}>
      <div className="ds-flex-between-mb2">
        <h5 className="pg-doc-panel-title" style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '0.375rem' }}>{icon}</span> {title}
        </h5>
        <button
          type="button"
          onClick={() => onToggleAll(folders, !allSelected)}
          className="pg-cat-toggle-btn"
          style={{ padding: '0.125rem 0.5rem', fontSize: '0.625rem' }}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      </div>
      {folders.length > 0 ? (
        folders.map((folder) => (
          <FolderAccessTree
            key={folder.id}
            folder={folder}
            assignedFolderIds={assignedFolderIds}
            onToggle={onToggleSingle}
          />
        ))
      ) : (
        <div className="ds-text-empty-italic">No folders</div>
      )}
    </div>
  );
};
