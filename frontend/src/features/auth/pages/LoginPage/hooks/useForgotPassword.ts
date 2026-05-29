import { useState } from 'react';
import { submitPasswordResetRequest } from '../../../../../services/passwordReset/index';

export const useForgotPassword = () => {
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotReason, setForgotReason] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestError, setRequestError] = useState("");

  const handleForgotPassword = () => {
    setShowForgotModal(true);
    resetForm();
  };

  const handleCloseForgotModal = () => {
    setShowForgotModal(false);
    resetForm();
  };

  const resetForm = () => {
    setRequestSent(false);
    setRequestError("");
    setForgotUsername("");
    setForgotReason("");
    setIsSendingRequest(false);
  };

  const handleSendForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotUsername.trim()) {
      return;
    }

    setIsSendingRequest(true);
    setRequestError("");

    try {
      await submitPasswordResetRequest(forgotUsername, forgotReason);
      setRequestSent(true);
    } catch (err: any) {
      console.error("Failed to send password reset request:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send password reset request. Please try again later.";
      setRequestError(errorMessage);
    } finally {
      setIsSendingRequest(false);
    }
  };

  return {
    showForgotModal,
    forgotUsername,
    setForgotUsername,
    forgotReason,
    setForgotReason,
    requestSent,
    isSendingRequest,
    requestError,
    handleForgotPassword,
    handleCloseForgotModal,
    handleSendForgotRequest
  };
};

