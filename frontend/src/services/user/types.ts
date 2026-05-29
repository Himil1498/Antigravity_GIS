// Backend user model (from MySQL database)
export interface BackendUser {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  full_name: string;
  gender?: string;
  phone?: string;
  department?: string;
  office_location?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  role: string; // 'admin' | 'manager' | 'technician' | 'developer' | 'user'
  is_active: boolean;
  assignedRegions?: string[]; // Array of region names
  permissions?: string[] | string; // Array of permissions or JSON string
  regions?:
    | Array<{
        id: number;
        name: string;
        code: string;
        type: string;
        access_level: string;
      }>
    | string; // Array of region objects or JSON string (for backward compatibility)
  // Email verification fields
  is_email_verified?: boolean;
  email_verified_at?: string;
  manual_verification?: boolean;
  email_verified_by?: number;
  last_verification_email_sent?: string;
  created_at?: string;
  updated_at?: string;
}

// Backend API response formats
export interface BackendUserResponse {
  success: boolean;
  user: BackendUser;
  message?: string;
}

export interface BackendUsersListResponse {
  success: boolean;
  users: BackendUser[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
}

export interface BulkOperationResponse {
  success: boolean;
  count: number;
  message?: string;
}

export interface BulkAssignRegionsResponse {
  success: boolean;
  message: string;
  affectedUsers: number;
}

