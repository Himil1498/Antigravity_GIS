import { TemporaryRegionAccess } from '../../../types/temporaryAccess.types';

export interface UserProfile {
  name?: string;
  email?: string;
  role?: string;
  company?: string;
  assignedRegions?: string[];
  lastLogin?: string;
}

export interface ProfileDropdownProps {
  user: UserProfile | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  temporaryAccessCount: number;
  tempAccessGrants: TemporaryRegionAccess[];
  onLogout: () => void;
}

export type ExpiryWarningLevel = "safe" | "warning" | "critical";

