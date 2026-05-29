
import type { User } from '../../../types/auth/index';

export interface UserState {
  users: User[];
  selectedUsers: string[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    role: string;
    status: string;
    assignedRegion: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

