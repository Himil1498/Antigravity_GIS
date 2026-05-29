import type { UserGroup } from "../../../types/permissions/index";
import type { ApiGroup } from '../../../services/group/index';
import type { User } from "../../../types/auth/index";

export type TabType = "basic" | "permissions" | "members" | "regions";

export interface GroupFormProps {
  group: ApiGroup | null;
  onSave: (groupData: Partial<UserGroup>) => void;
  onCancel: () => void;
}

export interface GroupFormData {
  name: string;
  description: string;
  isActive: boolean;
  permissions: string[];
  members: string[];
  managers: string[];
  assignedRegions: string[];
}

export interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}



