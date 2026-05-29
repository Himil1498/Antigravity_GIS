import React from "react";
import UserTableRow from "./UserTableRow/index";
import UserManagementTableHeader from "./UserManagementTableHeader";
import { UserManagementTableProps } from "./UserManagementTableTypes";

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onPermissionsUser,
  onChangePassword,
  onVerifyEmail,
  onResendVerification,
  onForce2FA,
  onDisable2FA,
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl border-2 border-violet-100 dark:border-violet-900/30">
      <div className="overflow-x-auto">
        <table className="w-full">
          <UserManagementTableHeader
            isAllSelected={selectedUsers.length === users.length && users.length > 0}
            onSelectAll={onSelectAll}
          />
          <tbody className="divide-y divide-violet-100 dark:divide-violet-900/20">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                isSelected={selectedUsers.includes(user.id)}
                onSelect={onSelectUser}
                onView={onViewUser}
                onEdit={onEditUser}
                onDelete={onDeleteUser}
                onPermissions={onPermissionsUser}
                onChangePassword={onChangePassword}
                onVerifyEmail={onVerifyEmail}
                onResendVerification={onResendVerification}
                onForce2FA={onForce2FA}
                onDisable2FA={onDisable2FA}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementTable;

