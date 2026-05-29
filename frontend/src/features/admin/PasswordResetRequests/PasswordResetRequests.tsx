import React from "react";
import NotificationDialog from "../../../components/ui/NotificationDialog";
import { usePasswordResetRequests } from "./hooks/usePasswordResetRequests";
import RequestFilters from "./components/RequestFilters";
import RequestsList from "./components/RequestsList";
import ApproveModal from "./components/ApproveModal";
import RejectModal from "./components/RejectModal";
import DeleteModal from "./components/DeleteModal";

import { usePermission } from "../../../hooks/usePermission";
import AccessDenied from "../../admin/AuditLogViewer/components/AccessDenied"; // Reusing AccessDenied component

export const PasswordResetRequests: React.FC = () => {
  const { can, isAdmin } = usePermission();
  const canAccess = isAdmin || can("admin:password_reset");

  const {
    requests,
    filteredRequests,
    isLoading,
    statusFilter,
    setStatusFilter,
    selectedRequest,
    showApproveModal,
    setShowApproveModal,
    showRejectModal,
    setShowRejectModal,
    showDeleteModal,
    setShowDeleteModal,
    showMessageModal,
    setShowMessageModal,
    messageModalContent,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    reviewNote,
    setReviewNote,
    isProcessing,
    handleApprove,
    handleReject,
    handleDelete,
    generatePassword,
    handleSubmitApprove,
    handleSubmitReject,
    confirmDelete,
    showDeleteAllModal,
    setShowDeleteAllModal,
    handleDeleteAll,
    confirmDeleteAll,
  } = usePasswordResetRequests();

  if (!canAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-rose-800 dark:from-rose-400 dark:to-rose-600 bg-clip-text text-transparent mb-2">
          🔐 Password Reset Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and manage password reset requests from users
        </p>
      </div>

      {/* Filter Tabs */}
      <RequestFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onDeleteAll={handleDeleteAll}
        filters={[
          {
            value: "pending",
            label: "Pending",
            count: requests.filter((r) => r.status === "pending").length,
          },
          {
            value: "completed",
            label: "Completed",
            count: requests.filter((r) => r.status === "completed").length,
          },
          {
            value: "rejected",
            label: "Rejected",
            count: requests.filter((r) => r.status === "rejected").length,
          },
          { value: "all", label: "All", count: requests.length },
        ]}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Requests List */}
      {!isLoading && (
        <RequestsList
          requests={filteredRequests}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <ApproveModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        request={selectedRequest}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        reviewNote={reviewNote}
        setReviewNote={setReviewNote}
        onGeneratePassword={generatePassword}
        onSubmit={handleSubmitApprove}
        isProcessing={isProcessing}
      />

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        request={selectedRequest}
        reviewNote={reviewNote}
        setReviewNote={setReviewNote}
        onSubmit={handleSubmitReject}
        isProcessing={isProcessing}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />

      <DeleteModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={confirmDeleteAll}
        title="Delete All Requests?"
        message={`Are you sure you want to delete ALL ${statusFilter !== "all" ? statusFilter : ""} password reset requests? This action cannot be undone.`}
      />

      <NotificationDialog
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title={messageModalContent.title}
        message={messageModalContent.message}
        type={messageModalContent.type}
      />
    </div>
  );
};

export default PasswordResetRequests;

