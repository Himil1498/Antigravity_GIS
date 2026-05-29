import { User } from "../../../types/auth/index";

export interface UserManagementTableProps {
  users: User[];
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
  onViewUser?: (user: User) => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
  onPermissionsUser?: (user: User) => void;
  onChangePassword?: (user: User) => void;
  onVerifyEmail?: (user: User) => void;
  onResendVerification?: (user: User) => void;
  onForce2FA?: (user: User) => void;
  onDisable2FA?: (user: User) => void;
}

