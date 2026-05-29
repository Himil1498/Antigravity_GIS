/**
 * UserManagement Types and Interfaces
 */

import { User } from '../../types/auth/index';

export type ModalType = 'create' | 'edit' | 'view';

export interface BulkDeleteDialogState {
  isOpen: boolean;
  count: number;
}

// UserFormData is just an alias for Partial<User>
// This ensures type compatibility with User type
export type UserFormData = Partial<User>;

export interface FormErrors {
  [key: string]: string;
}


