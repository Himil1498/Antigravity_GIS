/**
 * User Groups Management Page
 * Create, edit, and manage user groups with permissions
 */
import React, { useState } from "react";
import PageContainer from "../components/ui/PageContainer";
import { usePermission } from "../hooks/usePermission";
import { useAppSelector } from "../store/index";
import {
  GroupsList,
  GroupForm,
  GroupDetailsDialog,
} from "../features/groups/index";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import NotificationDialog from "../components/ui/NotificationDialog";
import { GroupsHeader } from "../features/groups/components/layout/GroupsHeader";
import { GroupsStats } from "../features/groups/components/layout/GroupsStats";
import { BulkActionsBar } from "../features/groups/components/layout/BulkActionsBar";
import { AccessDenied } from "../features/groups/components/layout/AccessDenied";
import { useGroupsData } from "../hooks/useGroupsData";
import type { ApiGroup } from "../services/group/groupApiService";
import type { UserGroup } from "../types/permissions/index";

const GroupsManagement: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { can } = usePermission();

  const {
    groups,
    selectedGroups,
    notification,
    setNotification,
    createGroup,
    updateGroup,
    deleteGroup,
    bulkActivate,
    bulkDeactivate,
    toggleGroupSelection,
    toggleAllGroups,
  } = useGroupsData();

  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ApiGroup | null>(null);
  const [viewingGroup, setViewingGroup] = useState<ApiGroup | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setShowForm(true);
  };

  const handleViewGroup = (group: ApiGroup) => {
    setViewingGroup(group);
  };

  const handleEditGroup = (group: ApiGroup) => {
    setEditingGroup(group);
    setShowForm(true);
  };

  const handleDeleteGroup = (groupId: number) => {
    setDeleteConfirm(groupId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await deleteGroup(deleteConfirm);
    setDeleteConfirm(null);
  };

  const handleSaveGroup = async (groupData: Partial<UserGroup>) => {
    if (!user) return;

    const success = editingGroup
      ? await updateGroup(editingGroup.id, groupData)
      : await createGroup(groupData);

    if (success) {
      setShowForm(false);
      setEditingGroup(null);
    }
  };

  if (!can("groups:view")) {
    return (
      <PageContainer>
        <AccessDenied />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="bg-gray-50 dark:bg-gray-900">
        <GroupsHeader
          canCreate={can("groups:create")}
          onCreateGroup={handleCreateGroup}
        />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GroupsStats groups={groups} />

          <BulkActionsBar
            selectedCount={selectedGroups.length}
            onActivate={() => bulkActivate(selectedGroups)}
            onDeactivate={() => bulkDeactivate(selectedGroups)}
          />

          <GroupsList
            groups={groups}
            selectedGroups={selectedGroups}
            onSelectGroup={toggleGroupSelection}
            onSelectAll={toggleAllGroups}
            onView={handleViewGroup}
            onEdit={can("groups:edit") ? handleEditGroup : undefined}
            onDelete={can("groups:delete") ? handleDeleteGroup : undefined}
          />

          {showForm && (
            <GroupForm
              group={editingGroup}
              onSave={handleSaveGroup}
              onCancel={() => {
                setShowForm(false);
                setEditingGroup(null);
              }}
            />
          )}

          {viewingGroup && (
            <GroupDetailsDialog
              group={viewingGroup}
              onClose={() => setViewingGroup(null)}
            />
          )}

          <ConfirmDialog
            isOpen={deleteConfirm !== null}
            title="Delete Group"
            message="Are you sure you want to delete this group? This action cannot be undone."
            confirmText="Delete"
            type="danger"
            onConfirm={confirmDelete}
            onClose={() => setDeleteConfirm(null)}
          />

          <NotificationDialog
            isOpen={notification.isOpen}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => setNotification({ ...notification, isOpen: false })}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default GroupsManagement;

