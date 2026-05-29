import { useState, useEffect } from "react";
import {
  getAllPasswordResetRequests,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
  deletePasswordResetRequest,
  deleteAllPasswordResetRequests,
  PasswordResetRequest,
} from "../../../../services/passwordReset/index";
import { MessageModalContent } from "../types/types";
import { generateRandomPassword } from "../utils/utils";

export const usePasswordResetRequests = () => {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<
    PasswordResetRequest[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] =
    useState<PasswordResetRequest | null>(null);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState<number | null>(null);

  // Delete All Modal
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Message Modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] =
    useState<MessageModalContent>({
      title: "",
      message: "",
      type: "success",
    });

  // Action states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Show message dialog
  const showMessage = (
    title: string,
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setMessageModalContent({ title, message, type });
    setShowMessageModal(true);
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const data = await getAllPasswordResetRequests("all");
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((r) => r.status === statusFilter));
    }
  }, [statusFilter, requests]);

  // Handlers
  const handleApprove = (request: PasswordResetRequest) => {
    setSelectedRequest(request);
    setNewPassword("");
    setConfirmPassword("");
    setReviewNote("");
    setShowApproveModal(true);
  };

  const handleReject = (request: PasswordResetRequest) => {
    setSelectedRequest(request);
    setReviewNote("");
    setShowRejectModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteRequestId(id);
    setShowDeleteModal(true);
  };

  const generatePassword = () => {
    const password = generateRandomPassword();
    setNewPassword(password);
    setConfirmPassword(password);
  };

  // Submit Actions
  const handleSubmitApprove = async () => {
    if (!selectedRequest) return;

    if (newPassword.length < 6) {
      showMessage(
        "Validation Error",
        "Password must be at least 6 characters",
        "error",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Validation Error", "Passwords do not match", "error");
      return;
    }

    try {
      setIsProcessing(true);
      await approvePasswordResetRequest(
        selectedRequest.id,
        newPassword,
        reviewNote,
      );
      setShowApproveModal(false);
      showMessage(
        "Success",
        "Password reset request approved! User will receive an email with the new password.",
        "success",
      );
      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      showMessage(
        "Error",
        "Failed to approve request. Please try again.",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitReject = async () => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      await rejectPasswordResetRequest(selectedRequest.id, reviewNote);
      setShowRejectModal(false);
      showMessage("Success", "Password reset request rejected.", "success");
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      showMessage(
        "Error",
        "Failed to reject request. Please try again.",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteRequestId) return;

    try {
      await deletePasswordResetRequest(deleteRequestId);
      setShowDeleteModal(false);
      fetchRequests();
      showMessage("Success", "Request deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting request:", error);
      setShowDeleteModal(false);
      showMessage("Error", "Failed to delete request.", "error");
    }
  };

  const handleDeleteAll = () => {
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAll = async () => {
    try {
      // Pass the current filter status to delete all matching that status
      // If statusFilter is 'all', backend deletes everything.
      await deleteAllPasswordResetRequests(statusFilter);
      setShowDeleteAllModal(false);
      fetchRequests();
      showMessage(
        "Success",
        "All matching requests deleted successfully.",
        "success",
      );
    } catch (error) {
      console.error("Error deleting all requests:", error);
      setShowDeleteAllModal(false);
      showMessage("Error", "Failed to delete requests.", "error");
    }
  };

  return {
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
  };
};

