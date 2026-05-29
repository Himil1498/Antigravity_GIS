export type { RegionAccessRequest, RegionRequestStatus } from '../../../../types/regionRequest.types';

export interface RequestStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  requestsByUser: Record<string, number>;
  requestsByRegion: Record<string, number>;
}

export interface NotificationState {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export interface DeleteDialogState {
  isOpen: boolean;
  request: any | null;
}

