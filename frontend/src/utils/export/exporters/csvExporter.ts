
import type { InfrastructureItem } from '../types';
import { escapeCSV } from '../helpers';

/**
 * Convert infrastructure/customer data to CSV format
 */
export function generateCSV(data: InfrastructureItem[]): Blob {
  // Define CSV headers
  const headers = [
    'ID', 'Type', 'Name', 'Unique ID', 'Network ID', 'Ref Code',
    'Latitude', 'Longitude', 'Street', 'City', 'State', 'Pincode', 'Landmark',
    'Contact Name', 'Contact Phone', 'Contact Email',
    'Customer Name', 'Nature of Business',
    'Is Rented', 'Rent Amount', 'Landlord Name', 'Landlord Contact',
    'Owner', 'Structure Type', 'Height (m)',
    'UPS Available', 'UPS Capacity', 'Backup Capacity', 'Power Source', 'Bandwidth',
    'Status', 'Notes', 'Created At', 'Updated At'
  ];

  // Convert data to CSV rows
  const rows = data.map(item => [
    item.id || '',
    item.item_type || '',
    item.item_name || '',
    item.unique_id || '',
    item.network_id || '',
    item.ref_code || '',
    item.latitude,
    item.longitude,
    item.address_street || '',
    item.address_city || '',
    item.address_state || '',
    item.address_pincode || '',
    item.address_landmark || '',
    item.contact_name || '',
    item.contact_phone || '',
    item.contact_email || '',
    item.customer_name || '',
    item.nature_of_business || '',
    item.is_rented ? 'Yes' : 'No',
    item.rent_amount || '',
    item.landlord_name || '',
    item.landlord_contact || '',
    item.owner || '',
    item.structure_type || '',
    item.height || '',
    item.ups_availability ? 'Yes' : 'No',
    item.ups_capacity || '',
    item.backup_capacity || '',
    item.power_source || '',
    item.bandwidth || '',
    item.status || '',
    item.notes || '',
    item.created_at || '',
    item.updated_at || ''
  ].map(escapeCSV));

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  return blob;
}

