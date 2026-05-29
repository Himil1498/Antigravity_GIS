/**
 * RegionRequestManagement - Main Component
 * Refactored with extracted sub-components
 */

import React, { useState, useEffect } from "react";
import { useAppSelector } from "../../../../store/index";
import { showToast, toastMessages } from "../../../../utils/toastUtils";
import {
  getRegionRequests,
  getFilteredRegionRequests,
  approveRegionRequest,
  rejectRegionRequest,
  getRegionRequestStats,
  deleteRegionRequest,
} from "../../../../services/regionRequest/index";
import type { RegionAccessRequest, RegionRequestStatus } from "../types/types";
import NotificationDialog from "../../../../components/ui/NotificationDialog";
import DeleteConfirmationDialog from "../../../../components/ui/DeleteConfirmationDialog";
import { usePermission } from "../../../../hooks/usePermission";
import StatsCards from "./StatsCards";
import RegionRequestsTable from "./RegionRequestsTable";
import RegionRequestHeader from "./RegionRequestHeader";
import RequestFilterPanel from "./RequestFilterPanel";
import RequestReviewDialog from "./RequestReviewDialog";
import AccessDeniedMessage from "./AccessDeniedMessage";
import type {
  RequestStats,
  NotificationState,
  DeleteDialogState,
} from "../types/types";

const RegionRequestManagement: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { can, isAdmin } = usePermission();
  const canAccess = isAdmin || can("admin:region_request");

  const [requests, setRequests] = useState<RegionAccessRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<RegionRequestStatus | "all">(
    "all",
  );
  const [selectedRequest, setSelectedRequest] =
    useState<RegionAccessRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
    null,
  );

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    request: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [stats, setStats] = useState<RequestStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    requestsByUser: {},
    requestsByRegion: {},
  });

  useEffect(() => {
    loadRequests();
  }, [filterStatus]);

  useEffect(() => {
    const loadStats = async () => {
      const statsData = await getRegionRequestStats();
      setStats(statsData);
    };
    loadStats();
  }, [requests]);

  const loadRequests = async () => {
    if (filterStatus === "all") {
      const reqs = await getRegionRequests();
      setRequests(reqs);
    } else {
      const reqs = await getFilteredRegionRequests({ status: filterStatus });
      setRequests(reqs);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadRequests(),
        getRegionRequestStats().then(setStats)
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApprove = (request: RegionAccessRequest) => {
    setSelectedRequest(request);
    setReviewAction("approve");
    setReviewNotes("");
    setShowReviewDialog(true);
  };

  const handleReject = (request: RegionAccessRequest) => {
    setSelectedRequest(request);
    setReviewAction("reject");
    setReviewNotes("");
    setShowReviewDialog(true);
  };

  const confirmReview = async () => {
    if (!user || !selectedRequest || !reviewAction) return;

    try {
      if (reviewAction === "approve") {
        const result = await approveRegionRequest(
          selectedRequest.id,
          user,
          reviewNotes,
        );
        if (result) {
          showToast.success(toastMessages.region.requestApproved);
        }
      } else {
        const result = await rejectRegionRequest(
          selectedRequest.id,
          user,
          reviewNotes,
        );
        if (result) {
          showToast.success(toastMessages.region.requestRejected);
        }
      }

      await loadRequests();
      handleCancelReview();
    } catch (error) {
      showToast.error("Failed to process the request. Please try again.");
      console.error("Error processing request:", error);
    }
  };

  const handleCancelReview = () => {
    setShowReviewDialog(false);
    setSelectedRequest(null);
    setReviewAction(null);
    setReviewNotes("");
  };

  const handleDeleteClick = (request: RegionAccessRequest) => {
    setDeleteDialog({
      isOpen: true,
      request,
    });
  };

  const handleConfirmDelete = async () => {
    if (!user || !deleteDialog.request) return;

    setIsDeleting(true);
    try {
      await deleteRegionRequest(deleteDialog.request.id, user);
      showToast.success("Region request deleted successfully");
      setDeleteDialog({ isOpen: false, request: null });
      await loadRequests();
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete the request";
      showNotification("error", "Delete Failed", errorMessage);
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const showNotification = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
  ) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const closeNotification = () => {
    setNotification({ ...notification, isOpen: false });
  };

  if (!canAccess) {
    return <AccessDeniedMessage />;
  }


  return (
    <div className="space-y-6">
      <RegionRequestHeader 
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh} 
      />

      <StatsCards stats={stats} />

      <RequestFilterPanel
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        requestCount={requests.length}
      />

      <RegionRequestsTable
        requests={requests}
        filterStatus={filterStatus}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDeleteClick}
      />

      <RequestReviewDialog
        isOpen={showReviewDialog}
        request={selectedRequest}
        action={reviewAction}
        reviewNotes={reviewNotes}
        onNotesChange={setReviewNotes}
        onConfirm={confirmReview}
        onCancel={handleCancelReview}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, request: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Region Request"
        message="Are you sure you want to delete this region access request?"
        itemName={
          deleteDialog.request ? `${deleteDialog.request.userName}` : ""
        }
        isLoading={isDeleting}
        type="danger"
      />

      <NotificationDialog
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={notification.type === "success"}
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default RegionRequestManagement;
