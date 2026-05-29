
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../../types/auth/index';
import { initialState } from './initialState';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkUpdateUsers,
  bulkDeleteUsers,
} from './thunks';

// User Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Selection Management
    selectUser: (state, action: PayloadAction<string>) => {
      if (!state.selectedUsers.includes(action.payload)) {
        state.selectedUsers.push(action.payload);
      }
    },
    deselectUser: (state, action: PayloadAction<string>) => {
      state.selectedUsers = state.selectedUsers.filter(id => id !== action.payload);
    },
    toggleUserSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedUsers.indexOf(action.payload);
      if (index === -1) {
        state.selectedUsers.push(action.payload);
      } else {
        state.selectedUsers.splice(index, 1);
      }
    },
    selectAllUsers: (state) => {
      state.selectedUsers = state.users.map(user => user.id);
    },
    deselectAllUsers: (state) => {
      state.selectedUsers = [];
    },

    // Filter Management
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setRoleFilter: (state, action: PayloadAction<string>) => {
      state.filters.role = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
    },
    setRegionFilter: (state, action: PayloadAction<string>) => {
      state.filters.assignedRegion = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        role: '',
        status: '',
        assignedRegion: '',
      };
    },

    // Pagination
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },

    // Current User
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },

    // Error Handling
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder.addCase(fetchUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload;
      state.pagination.total = action.payload.length;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch users';
    });

    // Create User
    builder.addCase(createUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users.push(action.payload);
      state.pagination.total += 1;
    });
    builder.addCase(createUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to create user';
    });

    // Update User
    builder.addCase(updateUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.isLoading = false;
      const { id, updates } = action.payload;
      const index = state.users.findIndex(user => user.id === id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...updates };
      }
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to update user';
    });

    // Delete User
    builder.addCase(deleteUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = state.users.filter(user => user.id !== action.payload);
      state.selectedUsers = state.selectedUsers.filter(id => id !== action.payload);
      state.pagination.total -= 1;
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to delete user';
    });

    // Bulk Update Users
    builder.addCase(bulkUpdateUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(bulkUpdateUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      const { userIds, updates } = action.payload;
      state.users = state.users.map(user =>
        userIds.includes(user.id) ? { ...user, ...updates } : user
      );
      state.selectedUsers = [];
    });
    builder.addCase(bulkUpdateUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to update users';
    });

    // Bulk Delete Users
    builder.addCase(bulkDeleteUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(bulkDeleteUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = state.users.filter(user => !action.payload.includes(user.id));
      state.selectedUsers = [];
      state.pagination.total -= action.payload.length;
    });
    builder.addCase(bulkDeleteUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to delete users';
    });
  },
});

export const {
  selectUser,
  deselectUser,
  toggleUserSelection,
  selectAllUsers,
  deselectAllUsers,
  setSearchFilter,
  setRoleFilter,
  setStatusFilter,
  setRegionFilter,
  clearFilters,
  setPage,
  setLimit,
  setCurrentUser,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;

