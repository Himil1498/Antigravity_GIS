export interface SecuritySettingsProps {
  userId?: number;
}

export interface MFAStatus {
  enabled: boolean;
  method: string;
  enabledAt: string | null;
}

export type PendingAction = 'enable' | 'disable' | null;

