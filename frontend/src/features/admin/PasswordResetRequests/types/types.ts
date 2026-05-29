import { PasswordResetRequest } from "../../../../services/passwordReset/index";

export type { PasswordResetRequest };

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface MessageModalContent {
  title: string;
  message: string;
  type: "success" | "error";
}

export interface RequestFiltersProps {
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  requests: PasswordResetRequest[];
}

export interface RequestsListProps {
  requests: PasswordResetRequest[];
  onApprove: (request: PasswordResetRequest) => void;
  onReject: (request: PasswordResetRequest) => void;
  onDelete: (id: number) => void;
}

