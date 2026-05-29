
// Real-time Updates
export interface WebSocketMessage {
  type: string;
  event: string;
  data: any;
  timestamp: string;
  channel?: string;
}

export interface SubscriptionRequest {
  channels: string[];
  filters?: Record<string, any>;
}

export interface SubscriptionResponse {
  subscription_id: string;
  channels: string[];
  status: 'active' | 'inactive';
}

// File Upload
export interface FileUploadRequest {
  file: File;
  type: 'avatar' | 'document' | 'import' | 'attachment';
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  file_id: string;
  file_url: string;
  filename: string;
  size: number;
  content_type: string;
  checksum: string;
  upload_completed: boolean;
}

export interface MultipartUploadRequest {
  filename: string;
  size: number;
  content_type: string;
  chunk_size?: number;
}

export interface MultipartUploadResponse {
  upload_id: string;
  chunk_urls: string[];
  chunk_size: number;
  total_chunks: number;
}

