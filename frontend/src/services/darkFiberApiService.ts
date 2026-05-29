import { apiService as axiosInstance } from "./api/index";

export interface DarkFiberDataResponse {
  status: string;
  data: {
    nodes: {
      type: string;
      features: DarkFiberNodeFeature[];
    };
    routes: {
      type: string;
      features: DarkFiberRouteFeature[];
    };
  };
}

export interface DarkFiberNodeFeature {
  type: string;
  geometry: { type: string; coordinates: number[] };
  properties: {
    id: number;
    import_id: number;
    name: string;
    type: 'POP' | 'Customer';
    [key: string]: any;
  };
}

export interface DarkFiberRouteFeature {
  type: string;
  geometry: { type: string; coordinates: number[][] };
  properties: {
    id: number;
    import_id: number;
    name: string;
    [key: string]: any;
  };
}

export interface DarkFiberImport {
  id: number;
  filename: string;
  imported_by: string;
  imported_at: string;
  status: string;
  folder_id?: number;
  folder_name?: string;
}

export interface DarkFiberFolder {
  id: number;
  name: string;
  created_at: string;
  is_deleted?: boolean;
  parent_id?: number | null;
}

export interface DarkFiberImportResponse {
  status: string;
  message: string;
  data: {
    importId: number;
    nodesAnalyzed: number;
    routesAnalyzed: number;
  };
}

export const darkFiberApiService = {
  /**
   * Fetches the Dark Fiber map data (Points and LineStrings)
   */
  getDarkFiberData: async (folderId?: number): Promise<DarkFiberDataResponse> => {
    try {
      const response = await axiosInstance.get('/dark-fiber/data', {
        params: { folderId, _t: Date.now() }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Dark Fiber data:', error);
      throw error;
    }
  },

  /**
   * Uploads a KML or KMZ file for Dark Fiber import
   */
  importFile: async (file: File, folderId?: number): Promise<DarkFiberImportResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('folderId', folderId.toString());

      const response = await axiosInstance.post('/dark-fiber/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000, 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  },

  /**
   * Fetches the list of all imports
   */
  getImports: async (folderId?: number): Promise<{ status: string; data: DarkFiberImport[] }> => {
    try {
      const response = await axiosInstance.get('/dark-fiber/imports', {
        params: { folderId, _t: Date.now() }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch imports:', error);
      throw error;
    }
  },

  /**
   * Deletes an entire import batch (Soft Delete)
   */
  deleteImport: async (id: number): Promise<{ status: string; message: string }> => {
    try {
      const response = await axiosInstance.delete(`/dark-fiber/import/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete import:', error);
      throw error;
    }
  },

  /* --- FOLDER MANAGEMENT --- */

  getFolders: async (): Promise<{ status: string; data: DarkFiberFolder[] }> => {
    try {
      const response = await axiosInstance.get('/dark-fiber-folders');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      throw error;
    }
  },

  createFolder: async (name: string, parentId?: number): Promise<{ status: string; data: DarkFiberFolder }> => {
    try {
      const response = await axiosInstance.post('/dark-fiber-folders', { name, parentId });
      return response.data;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  },

  updateFolder: async (id: number, name: string): Promise<{ status: string; data: DarkFiberFolder }> => {
    try {
      const response = await axiosInstance.put(`/dark-fiber-folders/${id}`, { name });
      return response.data;
    } catch (error) {
      console.error('Failed to update folder:', error);
      throw error;
    }
  },

  deleteFolder: async (id: number): Promise<{ status: string; message: string }> => {
    try {
      const response = await axiosInstance.delete(`/dark-fiber-folders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  },

  /* --- RECYCLE BIN --- */

  getRecycleBin: async (): Promise<{ status: string; data: any[] }> => {
    try {
      const response = await axiosInstance.get('/dark-fiber-folders/recycle-bin');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recycle bin:', error);
      throw error;
    }
  },

  restoreItem: async (type: 'folder' | 'file', id: number): Promise<{ status: string; message: string }> => {
    try {
      const response = await axiosInstance.put(`/dark-fiber-folders/restore/${type}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to restore item:', error);
      throw error;
    }
  },

  permanentDelete: async (type: 'folder' | 'file', id: number): Promise<{ status: string; message: string }> => {
    try {
      const response = await axiosInstance.delete(`/dark-fiber-folders/permanent/${type}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to permanent delete:', error);
      throw error;
    }
  },

  deleteNode: async (id: number): Promise<{ status: string; message: string }> => {
    try {
      const response = await axiosInstance.delete(`/dark-fiber/node/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete node:', error);
      throw error;
    }
  },

  deleteRoute: async (id: number): Promise<{ status: string; message: string }> => {
    try {
      const response = await axiosInstance.delete(`/dark-fiber/route/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete route:', error);
      throw error;
    }
  },

  createNode: async (data: { name: string, type: 'POP' | 'Customer', geometry: any, properties: any, folderId: number }): Promise<any> => {
    try {
      const response = await axiosInstance.post('/dark-fiber/node', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create node:', error);
      throw error;
    }
  },

  updateRouteGeometry: async (id: number, geometry: any): Promise<any> => {
    try {
      const response = await axiosInstance.put(`/dark-fiber/route/${id}/geometry`, { geometry });
      return response.data;
    } catch (error) {
      console.error('Failed to update route geometry:', error);
      throw error;
    }
  },
  
  createRoute: async (data: { name: string, geometry: any, properties: any, folderId: number }): Promise<any> => {
    try {
      const response = await axiosInstance.post('/dark-fiber/route', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create route:', error);
      throw error;
    }
  },

  updateRouteProperties: async (id: number, properties: any): Promise<any> => {
    try {
      const response = await axiosInstance.put(`/dark-fiber/route/${id}/properties`, { properties });
      return response.data;
    } catch (error) {
      console.error('Failed to update route properties:', error);
      throw error;
    }
  },

  updateNodeProperties: async (id: number, properties: any): Promise<any> => {
    try {
      const response = await axiosInstance.put(`/dark-fiber/node/${id}/properties`, { properties });
      return response.data;
    } catch (error) {
      console.error('Failed to update node properties:', error);
      throw error;
    }
  }
};
