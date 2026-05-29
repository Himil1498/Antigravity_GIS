
export interface InfrastructureItem {
  id?: number;
  item_type: string;
  item_name: string;
  unique_id?: string;
  network_id?: string;
  ref_code?: string;
  latitude: number;
  longitude: number;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_pincode?: string;
  address_landmark?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  customer_name?: string;
  nature_of_business?: string;
  is_rented?: boolean;
  rent_amount?: number;
  landlord_name?: string;
  landlord_contact?: string;
  owner?: string;
  structure_type?: string;
  height?: number;
  ups_availability?: boolean;
  ups_capacity?: string;
  backup_capacity?: string;
  power_source?: string;
  bandwidth?: string;
  status?: string;
  notes?: string;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerItem extends InfrastructureItem {
  customer_name: string;
}

export type ExportFormat = 'kml' | 'kmz' | 'xlsx' | 'csv' | 'json';
export type ExportCategory = 'all' | string; // 'all' or specific category name

