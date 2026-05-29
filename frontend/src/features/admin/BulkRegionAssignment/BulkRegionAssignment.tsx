import React from "react";
import NotificationDialog from "../../../components/ui/NotificationDialog";
import { useTemporaryRegionMonitor } from "../../../hooks/useTemporaryRegionMonitor";
import { useBulkRegionAssignment } from "./hooks/useBulkRegionAssignment";
import { usePermission } from "../../../hooks/usePermission";
import BulkRegionAssignmentHeader from "./components/BulkRegionAssignmentHeader";
import ActionSelection from "./components/ActionSelection";
import UserSelection from "./components/UserSelection";
import RegionSelection from "./components/RegionSelection";
import BulkAssignmentControls from "./components/BulkAssignmentControls";
import AccessDeniedView from "./components/AccessDeniedView";

const BulkRegionAssignment: React.FC = () => {
  const { can, isAdmin: isUserAdmin } = usePermission();
  const canAccess = isUserAdmin || can("admin:bulk_assignment");

  const {
    users,
    selectedUsers,
    selectedRegions,
    action,
    setAction,
    notification,
    isAdmin, // Still returned by hook but we use our own check for access
    handleUserToggle,
    handleRegionToggle,
    handleSelectAllUsers,
    handleSelectAllRegions,
    handleApplyBulkAssignment,
    closeNotification,
  } = useBulkRegionAssignment();

  // Enable real-time monitoring of temporary region expirations
  useTemporaryRegionMonitor(30000); // Check every 30 seconds

  if (!canAccess) {
    return <AccessDeniedView />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <BulkRegionAssignmentHeader />

      {/* Action Selection */}
      <ActionSelection action={action} setAction={setAction} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Selection */}
        <UserSelection
          users={users}
          selectedUsers={selectedUsers}
          handleUserToggle={handleUserToggle}
          handleSelectAllUsers={handleSelectAllUsers}
        />

        {/* Region Selection */}
        <RegionSelection
          selectedRegions={selectedRegions}
          handleRegionToggle={handleRegionToggle}
          handleSelectAllRegions={handleSelectAllRegions}
        />
      </div>

      {/* Apply Button */}
      <BulkAssignmentControls
        action={action}
        selectedUsersCount={selectedUsers.length}
        selectedRegionsCount={selectedRegions.length}
        handleApplyBulkAssignment={handleApplyBulkAssignment}
      />

      {/* Notification Dialog */}
      <NotificationDialog
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={closeNotification}
      />
    </div>
  );
};

export default BulkRegionAssignment;

