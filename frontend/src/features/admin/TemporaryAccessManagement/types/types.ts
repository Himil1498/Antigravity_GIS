/**
 * TemporaryAccessManagement - Type Definitions
 */

export type { TemporaryRegionAccess, TemporaryAccessFilter } from '../../../../types/temporaryAccess.types';

export interface SimpleUser {
  id: string;
  username?: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
}

export interface AccessStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
}

export interface NotificationState {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export interface DeleteDialogState {
  isOpen: boolean;
  grant: any | null;
}

