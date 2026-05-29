
import * as XLSX from 'xlsx';
import type { InfrastructureItem } from '../types';

/**
 * Convert infrastructure/customer data to Excel format
 */
export function generateXLSX(data: InfrastructureItem[], sheetName: string = 'GIS Data'): Blob {
  // Transform data for Excel
  const excelData = data.map(item => ({
    'ID': item.id || '',
    'Type': item.item_type || '',
    'Name': item.item_name || '',
    'Unique ID': item.unique_id || '',
    'Network ID': item.network_id || '',
    'Ref Code': item.ref_code || '',
    'Latitude': item.latitude,
    'Longitude': item.longitude,
    'Street': item.address_street || '',
    'City': item.address_city || '',
    'State': item.address_state || '',
    'Pincode': item.address_pincode || '',
    'Landmark': item.address_landmark || '',
    'Contact Name': item.contact_name || '',
    'Contact Phone': item.contact_phone || '',
    'Contact Email': item.contact_email || '',
    'Customer Name': item.customer_name || '',
    'Nature of Business': item.nature_of_business || '',
    'Is Rented': item.is_rented ? 'Yes' : 'No',
    'Rent Amount': item.rent_amount || '',
    'Landlord Name': item.landlord_name || '',
    'Landlord Contact': item.landlord_contact || '',
    'Owner': item.owner || '',
    'Structure Type': item.structure_type || '',
    'Height (m)': item.height || '',
    'UPS Available': item.ups_availability ? 'Yes' : 'No',
    'UPS Capacity': item.ups_capacity || '',
    'Backup Capacity': item.backup_capacity || '',
    'Power Source': item.power_source || '',
    'Bandwidth': item.bandwidth || '',
    'Status': item.status || '',
    'Notes': item.notes || '',
    'Created At': item.created_at || '',
    'Updated At': item.updated_at || ''
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate buffer and convert to blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  return blob;
}

