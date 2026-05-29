import React, { useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";

// Custom Hooks
import { useUserManagement } from "./hooks/useUserManagement";
import { useUserFilters } from "./hooks/useUserFilters";
import { useUserSelection } from "./hooks/useUserSelection";
import { useUserDialogs } from "./hooks/useUserDialogs";
import { usePermission } from "../../hooks/usePermission";
import { useUserImportExport } from "./hooks/useUserImportExport";
import * as userService from "../../services/user/index";
import { showToast } from "../../utils/toastUtils";

// Sub-components
import UserManagementHeader from "./components/UserManagementHeader";
import UserManagementFilters from "./components/UserManagementFilters";
import UserManagementBulkActions from "./components/UserManagementBulkActions";
import UserManagementTable from "./components/UserManagementTable";
import UserFormModal from "./components/UserFormModal/index";
import UserManagementStats from "./components/UserManagementStats";
import UserImportModal from "./components/UserImportModal";

// Dialogs
import { UserPermissionsDialog } from "./components/UserPermissionsDialog/index";
import DeleteUserDialog from "../../components/ui/DeleteUserDialog";
import DeleteConfirmationDialog from "../../components/ui/DeleteConfirmationDialog";
import ChangePasswordDialog from "./components/ChangePasswordDialog";
import EmailVerificationDialogs from "./dialogs/EmailVerificationDialogs";
import TwoFactorDialogs from "./dialogs/TwoFactorDialogs";

// URL action type
type UrlAction = "create" | "view" | "edit" | "permissions" | "change-password" | null;

const UserManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = usePermission();
  // User management hook (CRUD, form state)
  const {
    users,
    setUsers,
    isLoading,
    showModal,
    modalType,
    formData,
    formErrors,
    handleInputChange,
    handleFieldChange,
    handleCreateUser,
    handleEditUser,
    handleViewUser,
    handleSaveUser,
    handleDeleteUser,
    handleBulkDelete,
    handleBulkStatusChange,
    closeModal,
    loadUsers,
  } = useUserManagement();

  // Compute unique roles dynamically from users array
  const availableRoles = React.useMemo(() => {
    const seen: Record<string, boolean> = {};
    return users
      .map((u) => u.role)
      .filter((role): role is string => {
        if (!role || seen[role]) return false;
        seen[role] = true;
        return true;
      })
      .sort();
  }, [users]);

  // Filters hook
  const {
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filteredUsers,
    handleClearFilters,
  } = useUserFilters(users);

  // Selection hook
  const { selectedUsers, handleUserSelect, handleSelectAll, clearSelection } =
    useUserSelection();

  // Dialogs hook
  const {
    showDeleteDialog,
    userToDelete,
    bulkDeleteDialog,
    openDeleteDialog,
    closeDeleteDialog,
    closeBulkDeleteDialog,
    permissionsUser,
    openPermissionsDialog,
    closePermissionsDialog,
    showChangePasswordDialog,
    userToChangePassword,
    openChangePasswordDialog,
    closeChangePasswordDialog,
    showVerifyEmailDialog,
    showResendEmailDialog,
    userToVerify,
    openVerifyEmailDialog,
    closeVerifyEmailDialog,
    openResendEmailDialog,
    closeResendEmailDialog,
    showForce2FADialog,
    showDisable2FADialog,
    user2FAAction,
    openForce2FADialog,
    closeForce2FADialog,
    openDisable2FADialog,
    closeDisable2FADialog,
  } = useUserDialogs();

  // Import/Export hook
  const { handleExport, handleImportTemplate } = useUserImportExport();
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // ─── URL Deep-Linking Helpers ───────────────────────────────────────
  const setUrlAction = useCallback((action: UrlAction, userId?: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (action) {
      newParams.set("action", action);
      if (userId) newParams.set("userId", userId);
      else newParams.delete("userId");
    } else {
      newParams.delete("action");
      newParams.delete("userId");
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const clearUrlAction = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("action");
    newParams.delete("userId");
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const lastHandledUrlRef = useRef<string>("");

  // ─── URL → State Restore on Mount ──────────────────────────────────
  useEffect(() => {
    if (users.length === 0) return; // Wait for users to load

    const action = searchParams.get("action") as UrlAction;
    const userId = searchParams.get("userId");

    const currentUrlState = `${action}-${userId}`;

    if (!action) {
      lastHandledUrlRef.current = "";
      return;
    }

    // Prevent re-triggering for the same URL state (e.g. when `users` dependency updates after a save)
    if (lastHandledUrlRef.current === currentUrlState) {
      return;
    }

    lastHandledUrlRef.current = currentUrlState;

    if (action === "create") {
      handleCreateUser();
    } else if (userId) {
      const targetUser = users.find(u => u.id === userId);
      if (!targetUser) {
        lastHandledUrlRef.current = ""; // Reset so we can try again if user loads later
        return;
      }

      if (action === "view") {
        handleViewUser(targetUser);
      } else if (action === "edit") {
        handleEditUser(targetUser);
      } else if (action === "permissions") {
        openPermissionsDialog(targetUser);
      } else if (action === "change-password") {
        openChangePasswordDialog(targetUser);
      }
    }
  }, [users, searchParams, handleCreateUser, handleViewUser, handleEditUser, openPermissionsDialog, openChangePasswordDialog]);

  // ─── Document Title Updates ────────────────────────────────────────
  useEffect(() => {
    const action = searchParams.get("action") as UrlAction;
    const titleMap: Record<string, string> = {
      "create": "Create User",
      "view": "View User Details",
      "edit": "Edit User",
      "permissions": "Manage Permissions",
      "change-password": "Change Password",
    };
    if (action && titleMap[action]) {
      document.title = `${titleMap[action]} | Admin | OptiConnect GIS`;
    } else {
      document.title = "User Management | Admin | OptiConnect GIS";
    }
    return () => { document.title = "OptiConnect GIS"; };
  }, [searchParams]);

  // ─── Enhanced Modal Handlers (with URL sync) ──────────────────────
  const handleCreateUserWithUrl = useCallback(() => {
    handleCreateUser();
    setUrlAction("create");
  }, [handleCreateUser, setUrlAction]);

  const handleViewUserWithUrl = useCallback((user: any) => {
    handleViewUser(user);
    setUrlAction("view", user.id);
  }, [handleViewUser, setUrlAction]);

  const handleEditUserWithUrl = useCallback((user: any) => {
    handleEditUser(user);
    setUrlAction("edit", user.id);
  }, [handleEditUser, setUrlAction]);

  const openPermissionsWithUrl = useCallback((user: any) => {
    openPermissionsDialog(user);
    setUrlAction("permissions", user.id);
  }, [openPermissionsDialog, setUrlAction]);

  const openChangePasswordWithUrl = useCallback((user: any) => {
    openChangePasswordDialog(user);
    setUrlAction("change-password", user.id);
  }, [openChangePasswordDialog, setUrlAction]);

  const closeModalWithUrl = useCallback(() => {
    closeModal();
    clearUrlAction();
  }, [closeModal, clearUrlAction]);

  const handleSaveUserWithUrl = useCallback(async () => {
    const success = await handleSaveUser();
    if (success) {
      clearUrlAction();
    }
  }, [handleSaveUser, clearUrlAction]);

  const closePermissionsWithUrl = useCallback(() => {
    closePermissionsDialog();
    clearUrlAction();
  }, [closePermissionsDialog, clearUrlAction]);

  const closeChangePasswordWithUrl = useCallback(() => {
    closeChangePasswordDialog();
    clearUrlAction();
  }, [closeChangePasswordDialog, clearUrlAction]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadUsers();
      showToast.success("User list refreshed");
    } catch (error) {
      console.error("Refresh failed", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleImportUsers = async (importedData: any[]) => {
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Process sequentially with delay to avoid overwhelming server
    for (let i = 0; i < importedData.length; i++) {
      const row = importedData[i];
      try {
        // Map ALL fields from the new template
        const email = row['Email ID'] || row['Email'] || '';
        const username = row['User Name'] || row['Username'] || email;
        const fullName = row['Full Name'] || '';
        const password = row['Password'] || '';
        const phone = row['Mobile Number'] || row['Phone Number'] || row['Phone'] || '';
        const gender = row['Gender'] || '';
        const street = row['Street Address'] || row['Street'] || '';
        const city = row['City'] || '';
        const state = row['State'] || '';
        const department = row['Department'] || '';
        const role = row['Role'] || 'User';
        const officeLocation = row['Office Location'] || '';

        // Validate required fields
        if (!email) {
          errors.push(`Row ${i + 2}: Email ID is required`);
          failCount++;
          continue;
        }
        if (!fullName) {
          errors.push(`Row ${i + 2}: Full Name is required`);
          failCount++;
          continue;
        }
        if (!password) {
          errors.push(`Row ${i + 2}: Password is required`);
          failCount++;
          continue;
        }

        const userData = {
          username: username,
          email: email,
          name: fullName,
          password: password,
          phone: phone,
          gender: gender,
          street: street,
          city: city,
          state: state,
          department: department,
          role: role.toLowerCase(),
          officeLocation: officeLocation,
          status: 'Inactive', // Same as manual creation — no email sent until activated + permissions assigned
          address: {
            street: street,
            city: city,
            state: state,
            pincode: row['Pincode'] || ''
          },
          assignedRegions: row['Assigned Regions']
            ? row['Assigned Regions'].split(',').map((s: string) => s.trim())
            : []
        };

        await userService.createUser(userData as any);
        successCount++;

        // Add a small delay between requests to avoid overwhelming the server
        if (i < importedData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err?.message || 'Unknown error';
        console.error(`Failed to create user (Row ${i + 2}):`, row['Email ID'] || row['Email'], err);
        errors.push(`Row ${i + 2} (${row['Email ID'] || row['Email'] || 'unknown'}): ${errorMsg}`);
        failCount++;
      }
    }

    if (successCount > 0) {
      showToast.success(`Successfully imported ${successCount} user(s).`);
      await loadUsers(); // Refresh list
    }
    
    if (failCount > 0) {
      showToast.error(`Failed to import ${failCount} user(s). ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`);
    }
  };

  // Delete handlers
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    await handleDeleteUser(userToDelete.id);
    closeDeleteDialog();
  };

  const handleBulkDeleteClick = () => {
    if (selectedUsers.length === 0) {
      showToast.warning("Please select users to delete");
      return;
    }
  };

  const handleConfirmBulkDelete = async () => {
    await handleBulkDelete(selectedUsers);
    clearSelection();
    closeBulkDeleteDialog();
  };

  // Bulk status change handlers
  const handleActivateUsers = async () => {
    await handleBulkStatusChange(selectedUsers, "Active");
    clearSelection();
  };

  const handleDeactivateUsers = async () => {
    await handleBulkStatusChange(selectedUsers, "Inactive");
    clearSelection();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <UserManagementHeader
        onCreateUser={handleCreateUserWithUrl}
        canCreate={can("users:create")}
        onExport={() => handleExport(filteredUsers)}
        onImport={() => setShowImportModal(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        canExport={can("users:export")}
        canImport={can("users:import")}
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Statistics */}
        <UserManagementStats users={users} />

        {/* Filters */}
        <UserManagementFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterRole={filterRole}
          onRoleChange={setFilterRole}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          onClearFilters={handleClearFilters}
          availableRoles={availableRoles}
        />

        {/* Bulk Actions */}
        <UserManagementBulkActions
          selectedCount={selectedUsers.length}
          onActivate={handleActivateUsers}
          onDeactivate={handleDeactivateUsers}
          onDelete={handleBulkDeleteClick}
        />

        {/* Users Table */}
        <UserManagementTable
          users={filteredUsers}
          selectedUsers={selectedUsers}
          onSelectUser={handleUserSelect}
          onSelectAll={() => handleSelectAll(filteredUsers)}
          onViewUser={can("users:view") ? handleViewUserWithUrl : undefined}
          onEditUser={can("users:edit") ? handleEditUserWithUrl : undefined}
          onDeleteUser={can("users:delete") ? openDeleteDialog : undefined}
          onPermissionsUser={
            can("users:manage_permissions") ? openPermissionsWithUrl : undefined
          }
          onChangePassword={
            can("users:reset_password") || can("users:edit")
              ? openChangePasswordWithUrl
              : undefined
          }
          onVerifyEmail={
            can("users:manage_security") ? openVerifyEmailDialog : undefined
          }
          onResendVerification={
            can("users:manage_security") ? openResendEmailDialog : undefined
          }
          onForce2FA={
            can("users:manage_security") ? openForce2FADialog : undefined
          }
          onDisable2FA={
            can("users:manage_security") ? openDisable2FADialog : undefined
          }
        />
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={showModal}
        modalType={modalType}
        formData={formData}
        formErrors={formErrors}
        isLoading={isLoading}
        onClose={closeModalWithUrl}
        onSave={handleSaveUserWithUrl}
        onChange={handleInputChange}
        onFieldChange={handleFieldChange}
      />

      {/* Import Modal */}
      <UserImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportUsers}
        isLoading={isLoading}
      />

      {/* Permissions Dialog */}
      {permissionsUser && (
        <UserPermissionsDialog
          user={permissionsUser}
          onClose={closePermissionsWithUrl}
          onSave={loadUsers}
        />
      )}

      {/* Delete User Dialog */}
      {showDeleteDialog && userToDelete && (
        <DeleteUserDialog
          isOpen={showDeleteDialog}
          user={userToDelete}
          onConfirm={confirmDeleteUser}
          onCancel={closeDeleteDialog}
          isLoading={isLoading}
        />
      )}

      {/* Bulk Delete Dialog */}
      <DeleteConfirmationDialog
        isOpen={bulkDeleteDialog.isOpen}
        title="Delete Multiple Users"
        message={`Are you sure you want to delete ${bulkDeleteDialog.count} user(s)? This action cannot be undone.`}
        onConfirm={handleConfirmBulkDelete}
        onClose={closeBulkDeleteDialog}
        isLoading={isLoading}
      />

      {/* Change Password Dialog */}
      {showChangePasswordDialog && userToChangePassword && (
        <ChangePasswordDialog
          isOpen={showChangePasswordDialog}
          userId={userToChangePassword.id}
          userName={userToChangePassword.name}
          onClose={() => {
            closeChangePasswordWithUrl();
            loadUsers();
          }}
        />
      )}

      {/* Email Verification Dialogs */}
      <EmailVerificationDialogs
        showVerifyEmailDialog={showVerifyEmailDialog}
        showResendEmailDialog={showResendEmailDialog}
        userToVerify={userToVerify}
        isLoading={isLoading}
        onCloseVerifyEmail={closeVerifyEmailDialog}
        onCloseResendEmail={closeResendEmailDialog}
        onLoadUsers={loadUsers}
      />

      {/* 2FA Management Dialogs */}
      <TwoFactorDialogs
        showForce2FADialog={showForce2FADialog}
        showDisable2FADialog={showDisable2FADialog}
        user2FAAction={user2FAAction}
        isLoading={isLoading}
        onCloseForce2FA={closeForce2FADialog}
        onCloseDisable2FA={closeDisable2FADialog}
        setUsers={setUsers}
      />
    </div>
  );
};

export default UserManagement;

