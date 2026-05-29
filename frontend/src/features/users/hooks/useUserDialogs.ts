/**
 * User Dialogs Hook
 * Manages all dialog states for user management
 */

import { useState, useCallback } from 'react';
import { User } from '../../../types/auth/index';
import { BulkDeleteDialogState } from '../types';

export const useUserDialogs = () => {
  // Delete dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState<BulkDeleteDialogState>({
    isOpen: false,
    count: 0
  });

  // Permissions dialog
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);

  // Password dialog
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState<User | null>(null);

  // Email verification dialogs
  const [showVerifyEmailDialog, setShowVerifyEmailDialog] = useState(false);
  const [showResendEmailDialog, setShowResendEmailDialog] = useState(false);
  const [userToVerify, setUserToVerify] = useState<User | null>(null);

  // 2FA dialogs
  const [showForce2FADialog, setShowForce2FADialog] = useState(false);
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false);
  const [user2FAAction, setUser2FAAction] = useState<User | null>(null);

  // Delete handlers
  const openDeleteDialog = useCallback((user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
    setUserToDelete(null);
  }, []);

  const openBulkDeleteDialog = useCallback((count: number) => {
    setBulkDeleteDialog({ isOpen: true, count });
  }, []);

  const closeBulkDeleteDialog = useCallback(() => {
    setBulkDeleteDialog({ isOpen: false, count: 0 });
  }, []);

  // Permissions handlers
  const openPermissionsDialog = useCallback((user: User) => {
    setPermissionsUser(user);
  }, []);

  const closePermissionsDialog = useCallback(() => {
    setPermissionsUser(null);
  }, []);

  // Password handlers
  const openChangePasswordDialog = useCallback((user: User) => {
    setUserToChangePassword(user);
    setShowChangePasswordDialog(true);
  }, []);

  const closeChangePasswordDialog = useCallback(() => {
    setShowChangePasswordDialog(false);
    setUserToChangePassword(null);
  }, []);

  // Email verification handlers
  const openVerifyEmailDialog = useCallback((user: User) => {
    setUserToVerify(user);
    setShowVerifyEmailDialog(true);
  }, []);

  const closeVerifyEmailDialog = useCallback(() => {
    setShowVerifyEmailDialog(false);
    setUserToVerify(null);
  }, []);

  const openResendEmailDialog = useCallback((user: User) => {
    setUserToVerify(user);
    setShowResendEmailDialog(true);
  }, []);

  const closeResendEmailDialog = useCallback(() => {
    setShowResendEmailDialog(false);
    setUserToVerify(null);
  }, []);

  // 2FA handlers
  const openForce2FADialog = useCallback((user: User) => {
    setUser2FAAction(user);
    setShowForce2FADialog(true);
  }, []);

  const closeForce2FADialog = useCallback(() => {
    setShowForce2FADialog(false);
    setUser2FAAction(null);
  }, []);

  const openDisable2FADialog = useCallback((user: User) => {
    setUser2FAAction(user);
    setShowDisable2FADialog(true);
  }, []);

  const closeDisable2FADialog = useCallback(() => {
    setShowDisable2FADialog(false);
    setUser2FAAction(null);
  }, []);

  return {
    // Delete dialog state
    showDeleteDialog,
    userToDelete,
    bulkDeleteDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openBulkDeleteDialog,
    closeBulkDeleteDialog,

    // Permissions dialog state
    permissionsUser,
    openPermissionsDialog,
    closePermissionsDialog,

    // Password dialog state
    showChangePasswordDialog,
    userToChangePassword,
    openChangePasswordDialog,
    closeChangePasswordDialog,

    // Email verification dialog state
    showVerifyEmailDialog,
    showResendEmailDialog,
    userToVerify,
    openVerifyEmailDialog,
    closeVerifyEmailDialog,
    openResendEmailDialog,
    closeResendEmailDialog,

    // 2FA dialog state
    showForce2FADialog,
    showDisable2FADialog,
    user2FAAction,
    openForce2FADialog,
    closeForce2FADialog,
    openDisable2FADialog,
    closeDisable2FADialog
  };
};


