/**
 * Type definitions for Region Request Form feature
 * Location: Frontend/src/components/RegionRequestForm/types.ts
 */

export type RequestType = 'access' | 'modification' | 'creation';

export interface NotificationState {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface RegionRequestFormProps {
  onSubmit?: () => void;
}

export interface RequestTypeButtonProps {
  type: RequestType;
  currentType: RequestType;
  label: string;
  description: string;
  onClick: (type: RequestType) => void;
}

export interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

export interface ReasonInputProps {
  reason: string;
  onReasonChange: (reason: string) => void;
}

export interface FormActionsProps {
  loading: boolean;
  onClear: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

