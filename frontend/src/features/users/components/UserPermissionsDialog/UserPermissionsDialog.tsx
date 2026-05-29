import React from "react";
import { rolesMatch } from "../../../../utils/userHelpers";
import { useUserPermissionsDialog } from "./useUserPermissionsDialog";
import UserPermissionsDialogContent from "./UserPermissionsDialogContent";
import { UserPermissionsDialogProps } from "./types";
import { VISIBLE_PERMISSIONS } from "./permissionConfig";
import { SYSTEM_PERMISSIONS } from "../../../../types/permissions/index"; // Only for count logic fallback if needed, or remove
import ConfirmDialog from "../../../../components/ui/ConfirmDialog";

const UserPermissionsDialog: React.FC<UserPermissionsDialogProps> = ({
  user,
  onSave,
  onClose,
}) => {
  const {
    selectedPermissions,
    groupPermissions,
    catalog,
    folderAssignments,
    folderAddAssignments,
    infrastructureFolders,
    customerFolders,
    othersFolders,
    assignedRegions,
    setAssignedRegions,
    isLoading,
    isSaving,
    error,
    activeTab,
    setActiveTab,
    togglePermission,
    togglePermissionGroup,
    selectAllPermissionsInCategory,
    selectAllPermissions,
    toggleFolderAccess,
    toggleCategoryFolderAccess,
    toggleFolderAddAccess,
    toggleCategoryFolderAddAccess,
    handleSave,
    totalPermissionsCount,
    permissionWarning,
    closeWarning,
  } = useUserPermissionsDialog(user, onSave, onClose);

  const handleActivateAndSave = () => {
    // Call save with shouldActivate = true
    handleSave(true);
  };

  // Lock body scroll when dialog is open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-60 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl px-5 pt-4 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-2 sm:align-middle sm:max-w-[98vw] sm:w-full h-[98vh]">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Permission Management
                  </h3>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {user.name}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {user.email}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                        rolesMatch(user.role, "Admin")
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : rolesMatch(user.role, "Manager")
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {user.role}
                    </span>
                    {user.status !== "Active" && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Inactive (Draft)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {
                      Array.from(new Set([
                        ...selectedPermissions,
                        ...(groupPermissions || [])
                      ])).filter((p) =>
                        Object.values(VISIBLE_PERMISSIONS)
                          .flat()
                          .includes(p),
                      ).length
                    }
                    <span className="text-sm text-gray-500">
                      /{Object.values(VISIBLE_PERMISSIONS).flat().length}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Permissions
                  </p>
                </div>
                <div className="text-right hidden sm:block border-l pl-3 ml-3 border-gray-200 dark:border-gray-700">
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {(() => {
                      const getAssignedCount = (
                        folders: any[],
                        assignments: typeof folderAssignments,
                      ) => {
                        const assignedIds = new Set(
                          assignments.map((a) => a.folder_id),
                        );
                        let count = 0;
                        const traverse = (nodes: any[]) => {
                          nodes.forEach((node) => {
                            if (assignedIds.has(node.id)) count++;

                            // Special handling for Indus, Elevor, Ascend:
                            // Treat as leaf nodes for counting (ignore children)
                            const name = (node.name || "").toLowerCase();
                            if (
                              name.includes("indus") ||
                              name.includes("elevor") ||
                              name.includes("ascend")
                            ) {
                              return;
                            }

                            if (node.children) traverse(node.children);
                          });
                        };
                        traverse(folders || []);
                        return count;
                      };
                      return getAssignedCount(
                        infrastructureFolders,
                        folderAssignments,
                      );
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Infra Folders
                  </p>
                </div>
                <div className="text-right hidden sm:block border-l pl-3 ml-3 border-gray-200 dark:border-gray-700">
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {(() => {
                      const getAssignedCount = (
                        folders: any[],
                        assignments: typeof folderAssignments,
                      ) => {
                        const assignedIds = new Set(
                          assignments.map((a) => a.folder_id),
                        );
                        let count = 0;
                        const traverse = (nodes: any[]) => {
                          nodes.forEach((node) => {
                            if (assignedIds.has(node.id)) count++;
                            if (node.children) traverse(node.children);
                          });
                        };
                        traverse(folders || []);
                        return count;
                      };
                      return getAssignedCount(customerFolders, folderAssignments);
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cust Folders
                  </p>
                </div>
                <div className="text-right hidden sm:block border-l pl-3 ml-3 border-gray-200 dark:border-gray-700">
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {assignedRegions.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Regions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-gray-500 hover:text-white dark:text-gray-400 hover:bg-red-500 rounded-lg transition-all duration-300 group shadow-sm"
                  aria-label="Close"
                >
                  <svg
                    className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex-shrink-0">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-600 dark:text-red-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              <UserPermissionsDialogContent
                isLoading={isLoading}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                catalog={catalog}
                selectedPermissions={selectedPermissions}
                groupPermissions={groupPermissions}
                infrastructureFolders={infrastructureFolders}
                customerFolders={customerFolders}
                othersFolders={othersFolders}
                folderAssignments={folderAssignments}
                folderAddAssignments={folderAddAssignments}
                assignedRegions={assignedRegions}
                setAssignedRegions={setAssignedRegions}
                togglePermission={togglePermission}
                togglePermissionGroup={togglePermissionGroup}
                selectAllPermissionsInCategory={selectAllPermissionsInCategory}
                selectAllPermissions={selectAllPermissions}
                toggleFolderAccess={toggleFolderAccess}
                toggleCategoryFolderAccess={toggleCategoryFolderAccess}
                toggleFolderAddAccess={toggleFolderAddAccess}
                toggleCategoryFolderAddAccess={toggleCategoryFolderAddAccess}
                user={user}
              />
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
              <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {selectedPermissions.length}
                </span>{" "}
                permissions selected
                {" • "}
                {folderAssignments.length} folders assigned
              </div>
              <div className="flex items-center space-x-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    user.status === "Active"
                      ? handleSave(false)
                      : handleActivateAndSave()
                  }
                  disabled={isLoading || isSaving}
                  className={`px-4 py-2 border-2 border-transparent rounded-lg text-xs font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    user.status === "Active"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:ring-green-500"
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        {user.status === "Active" ? (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        <span>
                          {user.status === "Active"
                            ? "Update Permissions"
                            : "Activate Account"}
                        </span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={permissionWarning.isOpen}
        title="Action Denied"
        message={`You cannot remove this permission because it is inherited from the role '${user.role}'. To remove this permission, you must update the role itself or assign a different role to this user.`}
        confirmText="OK"
        cancelText="Close"
        type="warning"
        onConfirm={closeWarning}
        onClose={closeWarning}
      />
    </div>
  );
};

export default UserPermissionsDialog;

