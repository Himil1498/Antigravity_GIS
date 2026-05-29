import React, { useState } from "react";
import { useAppSelector } from "../../../../store/index";
import { rolesMatch } from "../../../../utils/userHelpers";
import { usePermission } from "../../../../hooks/usePermission";
import NotificationDialog from "../../../../components/ui/NotificationDialog";
import DeleteConfirmationDialog from "../../../../components/ui/DeleteConfirmationDialog";
import StatsCards from "./StatsCards";
import GrantAccessForm from "./GrantAccessForm";
import FiltersSection from "./FiltersSection";
import GrantsTable from "./GrantsTable";
import ExtendModal from "./ExtendModal";
import RevokeModal from "./RevokeModal";
import {
  useTemporaryAccess,
  createGrantAccessHandler,
  createExtendHandler,
  createRevokeHandler,
  createDeleteHandler,
} from "../hooks/useTemporaryAccess";
import AccessDenied from "./AccessDenied";
import TemporaryAccessHeader from "./TemporaryAccessHeader";
import ExpiringSoonWarning from "./ExpiringSoonWarning";
import type {
  TemporaryRegionAccess,
  NotificationState,
  DeleteDialogState,
} from "../types/types";

const TemporaryAccessManagementMain: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const { can, isAdmin } = usePermission();
  const canAccess = isAdmin || can("admin:temp_access");

  // Form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [reason, setReason] = useState("");

  // Filter state
  const [filterUserId, setFilterUserId] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "expired" | "revoked"
  >("all");

  // Modal state
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedGrant, setSelectedGrant] =
    useState<TemporaryRegionAccess | null>(null);
  const [newExpirationDate, setNewExpirationDate] = useState("");
  const [revokeReason, setRevokeReason] = useState("");

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    grant: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  // Load data using custom hook
  const {
    grants,
    users,
    loading,
    setLoading,
    stats,
    expiringGrants,
    loadData,
  } = useTemporaryAccess(currentUser, filterUserId, filterRegion, filterStatus);

  const showNotification = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
  ) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const resetForm = () => {
    setSelectedUserId("");
    setSelectedRegion("");
    setExpirationDate("");
    setReason("");
  };

  // Create handlers using factory functions
  const handleGrantAccess = createGrantAccessHandler(
    users,
    currentUser,
    loadData,
    setLoading,
    showNotification,
  );
  const handleExtendAccess = createExtendHandler(
    currentUser,
    loadData,
    setLoading,
    showNotification,
  );
  const handleRevokeAccess = createRevokeHandler(
    currentUser,
    loadData,
    setLoading,
    showNotification,
  );
  const handleDeleteGrant = createDeleteHandler(
    currentUser,
    loadData,
    setLoading,
    showNotification,
  );

  const onGrantClick = () => {
    handleGrantAccess(
      selectedUserId,
      selectedRegion,
      expirationDate,
      reason,
      resetForm,
    );
  };

  const onExtendClick = () => {
    if (selectedGrant) {
      handleExtendAccess(selectedGrant.id, newExpirationDate).then(() => {
        setExtendModalOpen(false);
        setSelectedGrant(null);
        setNewExpirationDate("");
      });
    }
  };

  const onRevokeClick = () => {
    if (selectedGrant) {
      handleRevokeAccess(selectedGrant, revokeReason).then(() => {
        setRevokeModalOpen(false);
        setSelectedGrant(null);
        setRevokeReason("");
      });
    }
  };

  const onDeleteConfirm = () => {
    if (deleteDialog.grant) {
      setIsDeleting(true);
      handleDeleteGrant(deleteDialog.grant.id).finally(() => {
        setIsDeleting(false);
        setDeleteDialog({ isOpen: false, grant: null });
      });
    }
  };

  if (!canAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <TemporaryAccessHeader 
        isRefreshing={loading}
        onRefresh={() => loadData()} 
      />
      <StatsCards stats={stats} />
      <ExpiringSoonWarning expiringGrants={expiringGrants} />

      <GrantAccessForm
        users={users}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        expirationDate={expirationDate}
        setExpirationDate={setExpirationDate}
        reason={reason}
        setReason={setReason}
        onGrant={onGrantClick}
        loading={loading}
      />

      <FiltersSection
        users={users}
        filterUserId={filterUserId}
        setFilterUserId={setFilterUserId}
        filterRegion={filterRegion}
        setFilterRegion={setFilterRegion}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <GrantsTable
        grants={grants}
        onExtend={(grant) => {
          setSelectedGrant(grant);
          setNewExpirationDate("");
          setExtendModalOpen(true);
        }}
        onRevoke={(grant) => {
          setSelectedGrant(grant);
          setRevokeReason("");
          setRevokeModalOpen(true);
        }}
        onDelete={(grant) => setDeleteDialog({ isOpen: true, grant })}
      />

      <ExtendModal
        isOpen={extendModalOpen}
        grant={selectedGrant}
        newExpirationDate={newExpirationDate}
        setNewExpirationDate={setNewExpirationDate}
        onExtend={onExtendClick}
        onClose={() => {
          setExtendModalOpen(false);
          setSelectedGrant(null);
          setNewExpirationDate("");
        }}
        loading={loading}
      />

      <RevokeModal
        isOpen={revokeModalOpen}
        grant={selectedGrant}
        revokeReason={revokeReason}
        setRevokeReason={setRevokeReason}
        onRevoke={onRevokeClick}
        onClose={() => {
          setRevokeModalOpen(false);
          setSelectedGrant(null);
          setRevokeReason("");
        }}
        loading={loading}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, grant: null })}
        onConfirm={onDeleteConfirm}
        title="Delete Temporary Access Grant"
        message="Are you sure you want to delete this temporary access grant? This action cannot be undone."
        itemName={
          deleteDialog.grant
            ? `${deleteDialog.grant.userName} - ${deleteDialog.grant.region}`
            : ""
        }
        isLoading={isDeleting}
        type="danger"
      />

      <NotificationDialog
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default TemporaryAccessManagementMain;

