/**
 * Email Verification Dialogs
 * Handles manual email verification and resend verification email dialogs
 */

import React, { useState } from "react";
import { User } from "../../../types/auth/index";
import DeleteConfirmationDialog from "../../../components/ui/DeleteConfirmationDialog";
import * as userService from "../../../services/user/index";
import { showToast } from "../../../utils/toastUtils";

interface EmailVerificationDialogsProps {
  showVerifyEmailDialog: boolean;
  showResendEmailDialog: boolean;
  userToVerify: User | null;
  isLoading: boolean;
  onCloseVerifyEmail: () => void;
  onCloseResendEmail: () => void;
  onLoadUsers: () => Promise<void>;
}

const EmailVerificationDialogs: React.FC<EmailVerificationDialogsProps> = ({
  showVerifyEmailDialog,
  showResendEmailDialog,
  userToVerify,
  isLoading,
  onCloseVerifyEmail,
  onCloseResendEmail,
  onLoadUsers,
}) => {
  // Local loading states for each action
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const confirmVerifyEmail = async () => {
    if (!userToVerify) return;
    setVerifyLoading(true);

    try {
      const response = await userService.manualVerifyUserEmail(userToVerify.id);
      showToast.success(
        `Email verified for ${userToVerify.name}. Verified by: ${response.verifiedBy}`,
      );
      await onLoadUsers();
      onCloseVerifyEmail();
    } catch (error: any) {
      showToast.error(
        error.response?.data?.message || "Failed to verify email",
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const confirmResendVerification = async () => {
    if (!userToVerify) return;
    setResendLoading(true);

    try {
      await userService.resendVerificationEmail(userToVerify.id);
      showToast.success(`Verification email sent to ${userToVerify.email}`);
      await onLoadUsers();
      onCloseResendEmail();
    } catch (error: any) {
      showToast.error(
        error.response?.data?.message || "Failed to send verification email",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      {/* Verify Email Dialog */}
      <DeleteConfirmationDialog
        isOpen={showVerifyEmailDialog}
        title="Verify Email Address"
        message={`Manually verify email for ${userToVerify?.name}? This will mark their email as verified.`}
        confirmText="Verify"
        type="warning"
        loadingText="Verifying..."
        onConfirm={confirmVerifyEmail}
        onClose={onCloseVerifyEmail}
        isLoading={verifyLoading || isLoading}
      />

      {/* Resend Verification Email Dialog */}
      <DeleteConfirmationDialog
        isOpen={showResendEmailDialog}
        title="Resend Verification Email"
        message={`Send verification email to ${userToVerify?.email}?`}
        confirmText="Send Email"
        type="info"
        loadingText="Sending Email..."
        onConfirm={confirmResendVerification}
        onClose={onCloseResendEmail}
        isLoading={resendLoading || isLoading}
      />
    </>
  );
};

export default EmailVerificationDialogs;
