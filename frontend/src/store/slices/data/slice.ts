
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TelecomTower, NetworkCoverage, DataFilter, ImportJob } from './types';
import { initialState, initialFilters } from './initialState';

let errorIdCounter = 0;

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Loading States
    setLoading: (state, action: PayloadAction<{ loading: boolean; message?: string }>) => {
      state.isLoading = action.payload.loading;
      state.loadingMessage = action.payload.message || '';
    },

    // Tower Management
    setTowers: (state, action: PayloadAction<TelecomTower[]>) => {
      state.towers = action.payload;
      state.lastSync = new Date().toISOString();
      state.isDataStale = false;

      // Update statistics
      state.stats.totalTowers = action.payload.length;
      state.stats.activeTowers = action.payload.filter(t => t.status === 'active').length;

      // Company counts
      state.stats.companyCounts = action.payload.reduce((acc, tower) => {
        acc[tower.company] = (acc[tower.company] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Type counts
      state.stats.typeCounts = action.payload.reduce((acc, tower) => {
        acc[tower.type] = (acc[tower.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    },

    addTower: (state, action: PayloadAction<TelecomTower>) => {
      state.towers.push(action.payload);
      state.stats.totalTowers += 1;
      if (action.payload.status === 'active') {
        state.stats.activeTowers += 1;
      }
    },

    updateTower: (state, action: PayloadAction<{ id: string; updates: Partial<TelecomTower> }>) => {
      const index = state.towers.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        const oldTower = state.towers[index];
        state.towers[index] = { ...oldTower, ...action.payload.updates };

        // Update stats if status changed
        if (action.payload.updates.status && oldTower.status !== action.payload.updates.status) {
          if (oldTower.status === 'active') state.stats.activeTowers -= 1;
          if (action.payload.updates.status === 'active') state.stats.activeTowers += 1;
        }
      }
    },

    removeTower: (state, action: PayloadAction<string>) => {
      const tower = state.towers.find(t => t.id === action.payload);
      state.towers = state.towers.filter(t => t.id !== action.payload);
      if (tower) {
        state.stats.totalTowers -= 1;
        if (tower.status === 'active') {
          state.stats.activeTowers -= 1;
        }
      }
    },

    // Coverage Management
    setCoverage: (state, action: PayloadAction<NetworkCoverage[]>) => {
      state.coverage = action.payload;

      // Update coverage stats
      state.stats.coverageStats = action.payload.reduce((acc, cov) => {
        acc[cov.type] = (acc[cov.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    },

    addCoverage: (state, action: PayloadAction<NetworkCoverage>) => {
      state.coverage.push(action.payload);
    },

    // Filtering
    setFilters: (state, action: PayloadAction<Partial<DataFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters: (state) => {
      state.filters = initialFilters;
      state.filteredTowerIds = [];
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setFilteredTowerIds: (state, action: PayloadAction<string[]>) => {
      state.filteredTowerIds = action.payload;
    },

    // Data Import/Export
    addImportJob: (state, action: PayloadAction<ImportJob>) => {
      state.importJobs.push(action.payload);
      state.activeImportId = action.payload.id;
    },

    updateImportJob: (state, action: PayloadAction<{ id: string; updates: Partial<ImportJob> }>) => {
      const index = state.importJobs.findIndex(job => job.id === action.payload.id);
      if (index !== -1) {
        state.importJobs[index] = { ...state.importJobs[index], ...action.payload.updates };

        if (action.payload.updates.status === 'completed' || action.payload.updates.status === 'failed') {
          state.activeImportId = null;
        }
      }
    },

    removeImportJob: (state, action: PayloadAction<string>) => {
      state.importJobs = state.importJobs.filter(job => job.id !== action.payload);
      if (state.activeImportId === action.payload) {
        state.activeImportId = null;
      }
    },

    // Cache Management
    markDataStale: (state) => {
      state.isDataStale = true;
    },

    setCacheExpiry: (state, action: PayloadAction<number>) => {
      state.dataCacheExpiry = action.payload;
    },

    // Error Handling
    addError: (state, action: PayloadAction<{ message: string; type: 'load' | 'filter' | 'import' | 'export' }>) => {
      state.errors.push({
        id: `error_${errorIdCounter++}`,
        message: action.payload.message,
        timestamp: Date.now(),
        type: action.payload.type,
      });
    },

    removeError: (state, action: PayloadAction<string>) => {
      state.errors = state.errors.filter(e => e.id !== action.payload);
    },

    clearErrors: (state) => {
      state.errors = [];
    },
  },
});

export const {
  setLoading,
  setTowers,
  addTower,
  updateTower,
  removeTower,
  setCoverage,
  addCoverage,
  setFilters,
  resetFilters,
  setSearchQuery,
  setFilteredTowerIds,
  addImportJob,
  updateImportJob,
  removeImportJob,
  markDataStale,
  setCacheExpiry,
  addError,
  removeError,
  clearErrors,
} = dataSlice.actions;

export default dataSlice.reducer;

