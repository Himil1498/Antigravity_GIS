
import { apiService } from '../api/index';

export interface SearchHistoryEntry {
  id?: number;
  user_id?: number;
  search_query: string;
  search_type: 'address' | 'coordinates' | 'feature' | 'user' | 'region';
  result_count?: number;
  searched_at?: string;
}

export interface RecentSearch {
  search_query: string;
  search_type: string;
  last_searched: string;
}

export interface SearchStats {
  total: number;
  by_type: Array<{ search_type: string; count: number }>;
  top_queries: Array<{
    search_query: string;
    search_type: string;
    frequency: number;
  }>;
}

interface SearchHistoryResponse {
  success: boolean;
  history: SearchHistoryEntry[];
  total: number;
  limit: number;
  offset: number;
}

class SearchHistoryService {
  private baseUrl = '/search-history';

  async getSearchHistory(limit: number = 20, offset: number = 0): Promise<SearchHistoryResponse> {
    try {
      const response = await apiService.get(`${this.baseUrl}?limit=${limit}&offset=${offset}`);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to fetch search history');
    } catch (error: any) {
      console.error('Error fetching search history:', error);
      throw error;
    }
  }

  async getRecentSearches(limit: number = 10): Promise<RecentSearch[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/recent?limit=${limit}`);
      if (response.data.success) {
        return response.data.recent_searches;
      }
      throw new Error(response.data.message || 'Failed to fetch recent searches');
    } catch (error: any) {
      console.error('Error fetching recent searches:', error);
      throw error;
    }
  }

  async addSearchToHistory(
    search_query: string,
    search_type: 'address' | 'coordinates' | 'feature' | 'user' | 'region',
    result_count: number = 0
  ): Promise<void> {
    try {
      const response = await apiService.post(this.baseUrl, {
        search_query,
        search_type,
        result_count
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add search to history');
      }
    } catch (error: any) {
      console.error('Error adding search to history:', error);
    }
  }

  async clearSearchHistory(): Promise<void> {
    try {
      const response = await apiService.delete(this.baseUrl);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to clear search history');
      }
    } catch (error: any) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }

  async deleteSearch(searchId: number): Promise<void> {
    try {
      const response = await apiService.delete(`${this.baseUrl}/${searchId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete search');
      }
    } catch (error: any) {
      console.error('Error deleting search:', error);
      throw error;
    }
  }

  async getSearchStats(): Promise<SearchStats> {
    try {
      const response = await apiService.get(`${this.baseUrl}/stats`);
      if (response.data.success) {
        return response.data.stats;
      }
      throw new Error(response.data.message || 'Failed to fetch search stats');
    } catch (error: any) {
      console.error('Error fetching search stats:', error);
      throw error;
    }
  }

  mapSearchType(globalSearchType: string): 'address' | 'coordinates' | 'feature' | 'user' | 'region' {
    switch (globalSearchType) {
      case 'place':
        return 'address';
      case 'coordinates':
        return 'coordinates';
      case 'savedData':
        return 'feature';
      default:
        return 'address';
    }
  }
}

export const searchHistoryService = new SearchHistoryService();
export default searchHistoryService;

