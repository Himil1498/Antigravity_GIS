
import { DataState, DataFilter } from './types';

export const initialFilters: DataFilter = {
  companies: [],
  towerTypes: [],
  statusFilters: ['active'],
  dateRange: null,
  signalStrengthRange: { min: 0, max: 100 },
  geoBounds: null,
};

export const initialState: DataState = {
  towers: [],
  coverage: [],

  isLoading: false,
  loadingMessage: '',
  lastSync: null,

  filters: initialFilters,
  searchQuery: '',
  filteredTowerIds: [],

  importJobs: [],
  activeImportId: null,

  dataCacheExpiry: 5 * 60 * 1000, // 5 minutes
  isDataStale: false,

  stats: {
    totalTowers: 0,
    activeTowers: 0,
    companyCounts: {},
    typeCounts: {},
    coverageStats: {},
  },

  errors: [],
};

