/**
 * User Management Hook
 * Manages CRUD operations, form state, and API interactions
 */

import { useState, useEffect, useCallback } from 'react';
import { User } from '../../../types/auth/index';
import * as userService from '../../../services/user/index';
import { showToast, toastMessages } from '../../../utils/toastUtils';
import { useTemporaryRegionMonitor } from '../../../hooks/useTemporaryRegionMonitor';
import { validateForm } from '../helpers/userValidation';
import { getInitialFormData } from '../helpers/userFormDefaults';
import { MOCK_USERS } from '../constants/mockUsers';
import { ModalType, UserFormData, FormErrors } from '../types';

export const useUserManagement = () => {
  // Users data
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('create');
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);

  // Form state
  const [formData, setFormData] = useState<UserFormData>(getInitialFormData());
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Enable real-time monitoring of temporary region expirations
  useTemporaryRegionMonitor(30000);

  // Load users from backend
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadingError(null);
    try {
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error('Error loading users:', error);
      setLoadingError(error.message || 'Failed to load users');
      setUsers(MOCK_USERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Form handlers
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setFormErrors({});
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    setFormErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleFieldChange = useCallback((name: string, value: any) => {
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    setFormErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  // CRUD Operations
  const handleCreateUser = useCallback(() => {
    resetForm();
    setCurrentUser(null);
    setModalType('create');
    setShowModal(true);
  }, [resetForm]);

  const handleEditUser = useCallback((user: User) => {
    setFormData({ ...user });
    setCurrentUser(user);
    setModalType('edit');
    setShowModal(true);
  }, []);

  const handleViewUser = useCallback((user: User) => {
    setFormData({ ...user });
    setCurrentUser(user);
    setModalType('view');
    setShowModal(true);
  }, []);

  const handleSaveUser = useCallback(async (): Promise<boolean> => {
    const errors = validateForm(formData, users, modalType, currentUser?.id);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return false;

    setIsLoading(true);
    try {
      if (modalType === 'create') {
        await userService.createUser(formData);
        showToast.success(toastMessages.user.created);
      } else if (modalType === 'edit' && currentUser && currentUser.id) {
        await userService.updateUser(currentUser.id, formData);
        showToast.success(toastMessages.user.updated);

        if (formData.assignedRegions) {
          window.dispatchEvent(new CustomEvent('userRegionsUpdated', {
            detail: {
              userIds: [currentUser.id],
              regions: formData.assignedRegions,
              action: 'replace'
            }
          }));
        }
      }

      await loadUsers();
      setShowModal(false);
      resetForm();
      return true;
    } catch (error: any) {
      console.error('Error saving user:', error);
      showToast.error(`Failed to save user: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [formData, users, modalType, currentUser, loadUsers, resetForm]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      await userService.deleteUser(userId);
      await loadUsers();
      showToast.success(toastMessages.user.deleted);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showToast.error(`Failed to delete user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [loadUsers]);

  const handleBulkDelete = useCallback(async (userIds: string[]) => {
    setIsLoading(true);
    try {
      const count = userIds.length;
      await userService.bulkDeleteUsers(Array.from(userIds));
      await loadUsers();
      showToast.success(toastMessages.user.bulkDeleted(count));
    } catch (error: any) {
      console.error('Error deleting users:', error);
      showToast.error(`Failed to delete users: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [loadUsers]);

  const handleBulkStatusChange = useCallback(async (userIds: string[], status: 'Active' | 'Inactive') => {
    setIsLoading(true);
    try {
      const count = userIds.length;
      await userService.bulkUpdateStatus(Array.from(userIds), status);
      await loadUsers();
      if (status === 'Active') {
        showToast.success(`${count} user(s) activated successfully!`);
      } else {
        showToast.success(`${count} user(s) deactivated successfully!`);
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      showToast.error(`Failed to update status: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [loadUsers]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [resetForm]);

  return {
    // Users data
    users,
    setUsers,
    isLoading,
    loadingError,
    loadUsers,

    // Modal state
    showModal,
    modalType,
    currentUser,

    // Form state
    formData,
    formErrors,
    handleInputChange,
    handleFieldChange,

    // CRUD operations
    handleCreateUser,
    handleEditUser,
    handleViewUser,
    handleSaveUser,
    handleDeleteUser,
    handleBulkDelete,
    handleBulkStatusChange,
    closeModal
  };
};


