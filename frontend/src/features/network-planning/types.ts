export interface NetworkFolder {
  id: number;
  name: string;
  parent_id: number | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  category?: "infrastructure" | "customer";
  default_icon?: string;
  total_feature_count?: number;
  status_counts?: { planned: number; live: number; imported: number };
}

export interface NetworkFile {
  id: number;
  folder_id: number | null;
  name: string;
  file_type: "kml" | "kmz";
  size_bytes?: number;
  created_at: string;
  uploaded_by?: number;
  processing_status?: "pending" | "processing" | "completed" | "failed";
  feature_count?: number;
  error_message?: string;
  icon_type?: string;
  properties?: any;
  metadata?: any;
}

export interface FolderContents {
  folders: NetworkFolder[];
  files: NetworkFile[];
  breadcrumbs: NetworkFolder[];
}


export interface FolderItem {
  id: number;
  name: string;
  count: number;
  featureCount?: number;
  children?: FolderItem[];
  files?: NetworkFile[];
  category?: "infrastructure" | "customer";
  default_icon?: string;
  is_system?: boolean;
}

export interface CatalogData {
  infrastructure: FolderItem[];
  customers: FolderItem[];
  others: FolderItem[];
}

