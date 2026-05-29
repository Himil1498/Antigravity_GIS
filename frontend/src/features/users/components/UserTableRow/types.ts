import { User } from "../../../../types/auth/index";

export interface UserTableRowProps {
  user: User;
  isSelected: boolean;
  onSelect: (userId: string) => void;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onPermissions?: (user: User) => void;
  onChangePassword?: (user: User) => void;
  onVerifyEmail?: (user: User) => void;
  onResendVerification?: (user: User) => void;
  onForce2FA?: (user: User) => void;
  onDisable2FA?: (user: User) => void;
}

export type RoleBadgeConfig = {
  bg: string;
  text: string;
  icon: React.ReactNode;
};

