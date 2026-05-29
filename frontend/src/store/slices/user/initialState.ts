
import { UserState } from './types';

export const initialState: UserState = {
  users: [],
  selectedUsers: [],
  currentUser: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    role: '',
    status: '',
    assignedRegion: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

