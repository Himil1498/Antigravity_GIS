export interface BulkAssignmentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedRegions: string[];
}

export type AssignmentAction = 'assign' | 'revoke' | 'replace';

export interface NotificationState {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

