/**
 * Two-Factor Authentication Dialogs
 * Handles force enable and disable 2FA dialogs
 */

import React from 'react';
import { User } from '../../../types/auth/index';
import DeleteConfirmationDialog from '../../../components/ui/DeleteConfirmationDialog';
import * as userService from '../../../services/user/index';
import { showToast } from '../../../utils/toastUtils';

interface TwoFactorDialogsProps {
  showForce2FADialog: boolean;
  showDisable2FADialog: boolean;
  user2FAAction: User | null;
  isLoading: boolean;
  onCloseForce2FA: () => void;
  onCloseDisable2FA: () => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const TwoFactorDialogs: React.FC<TwoFactorDialogsProps> = ({
  showForce2FADialog,
  showDisable2FADialog,
  user2FAAction,
  isLoading,
  onCloseForce2FA,
  onCloseDisable2FA,
  setUsers
}) => {
  const confirmForce2FA = async () => {
    if (!user2FAAction) return;

    try {
      const userId = typeof user2FAAction.id === 'string'
        ? parseInt(user2FAAction.id.replace(/OCGID/gi, ''), 10)
        : user2FAAction.id;

      const response = await userService.adminForce2FA(userId);

      if (response.user) {
        setUsers(prevUsers => prevUsers.map(u => {
          const uId = typeof u.id === 'string'
            ? parseInt(u.id.replace(/OCGID/gi, ''), 10)
            : u.id;
          return uId === userId ? {
            ...u,
            mfaEnabled: response.user.mfa_enabled,
            mfaMethod: response.user.mfa_method,
            mfaEnabledAt: response.user.mfa_enabled_at
          } : u;
        }));
      }

      showToast.success(`2FA enabled for ${user2FAAction.name}`);
      onCloseForce2FA();
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to enable 2FA');
    }
  };

  const confirmDisable2FA = async () => {
    if (!user2FAAction) return;

    try {
      const userId = typeof user2FAAction.id === 'string'
        ? parseInt(user2FAAction.id.replace(/OCGID/gi, ''), 10)
        : user2FAAction.id;

      const response = await userService.adminDisable2FA(userId);

      if (response.user) {
        setUsers(prevUsers => prevUsers.map(u => {
          const uId = typeof u.id === 'string'
            ? parseInt(u.id.replace(/OCGID/gi, ''), 10)
            : u.id;
          return uId === userId ? {
            ...u,
            mfaEnabled: response.user.mfa_enabled,
            mfaMethod: response.user.mfa_method,
            mfaEnabledAt: response.user.mfa_enabled_at
          } : u;
        }));
      }

      showToast.success(`2FA disabled for ${user2FAAction.name}`);
      onCloseDisable2FA();
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to disable 2FA');
    }
  };

  return (
    <>
      {/* Force Enable 2FA Dialog */}
      <DeleteConfirmationDialog
        isOpen={showForce2FADialog}
        title="Force Enable 2FA"
        message={`Force enable Two-Factor Authentication for ${user2FAAction?.name}? The user will be required to set up 2FA on their next login.`}
        confirmText="Enable 2FA"
        type="warning"
        onConfirm={confirmForce2FA}
        onClose={onCloseForce2FA}
        isLoading={isLoading}
      />

      {/* Disable 2FA Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDisable2FADialog}
        title="Disable 2FA"
        message={`Disable Two-Factor Authentication for ${user2FAAction?.name}? This will remove their 2FA requirement and they will be able to login with just their password.`}
        confirmText="Disable 2FA"
        type="danger"
        onConfirm={confirmDisable2FA}
        onClose={onCloseDisable2FA}
        isLoading={isLoading}
      />
    </>
  );
};

export default TwoFactorDialogs;


