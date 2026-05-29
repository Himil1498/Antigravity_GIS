import type { User } from "../../../../types/auth/index";
import { PermissionCategory } from "../../../../types/permissions/index";

export interface UserPermissionsDialogProps {
  user: User;
  onSave?: () => void;
  onClose: () => void;
}

export interface CategoryStyles {
  icon: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textLight: string;
  textDark: string;
  hoverLight: string;
  hoverDark: string;
  selectedBg: string;
  selectedBorder: string;
  checkboxColor: string;
  buttonBg: string;
  buttonHover: string;
  buttonSelectedBg: string;
  buttonSelectedHover: string;
}

export interface PermissionData {
  direct: string[];
  fromGroups: string[];
}



