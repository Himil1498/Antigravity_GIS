import type { RegionAccessRequest } from '../../../../types/regionRequest.types';

export interface NotificationState {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface RegionSelectionProps {
  selectedRegions: string[];
  assignedRegions: string[];
  pendingRegions: string[];
  onToggle: (region: string) => void;
}

export interface PendingRequestsProps {
  requests: RegionAccessRequest[];
  onCancel: (requestId: string) => void;
}

export interface RequestHistoryProps {
  requests: RegionAccessRequest[];
  onCancel?: (requestId: string) => void;
}

