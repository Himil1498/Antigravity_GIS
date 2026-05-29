
import * as XLSX from 'xlsx';
import type { User } from '../../types/auth/index';

/**
 * Export users to Excel (XLSX) format
 */
export const exportUsersToExcel = (users: User[], filename: string = 'users_export.xlsx'): void => {
  // Prepare data for export
  const exportData = users.map(user => ({
    'User ID': user.id,
    'Username': user.username,
    'Full Name': user.name,
    'Email': user.email,
    'Gender': user.gender,
    'Phone Number': user.phoneNumber,
    'Street': user.address.street,
    'City': user.address.city,
    'State': user.address.state,
    'Pincode': user.address.pincode,
    'Office Location': user.officeLocation,
    'Assigned Under': user.assignedUnder.join(', '),
    'Role': user.role,
    'Assigned Regions': user.assignedRegions.join(', '),
    'Status': user.status,
    'Company': user.company || '',
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // User ID
    { wch: 15 }, // Username
    { wch: 20 }, // Full Name
    { wch: 25 }, // Email
    { wch: 10 }, // Gender
    { wch: 15 }, // Phone
    { wch: 25 }, // Street
    { wch: 15 }, // City
    { wch: 15 }, // State
    { wch: 10 }, // Pincode
    { wch: 20 }, // Office Location
    { wch: 20 }, // Assigned Under
    { wch: 12 }, // Role
    { wch: 30 }, // Assigned Regions
    { wch: 10 }, // Status
    { wch: 15 }, // Company
  ];
  worksheet['!cols'] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

  // Save file
  XLSX.writeFile(workbook, filename);
};

/**
 * Export users to CSV format
 */
export const exportUsersToCSV = (users: User[], filename: string = 'users_export.csv'): void => {
  const exportData = users.map(user => ({
    'User ID': user.id,
    'Username': user.username,
    'Full Name': user.name,
    'Email': user.email,
    'Gender': user.gender,
    'Phone Number': user.phoneNumber,
    'Street': user.address.street,
    'City': user.address.city,
    'State': user.address.state,
    'Pincode': user.address.pincode,
    'Office Location': user.officeLocation,
    'Assigned Under': user.assignedUnder.join('; '),
    'Role': user.role,
    'Assigned Regions': user.assignedRegions.join('; '),
    'Status': user.status,
    'Company': user.company || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export users to JSON format
 */
export const exportUsersToJSON = (users: User[], filename: string = 'users_export.json'): void => {
  const jsonStr = JSON.stringify(users, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Download Excel template for user import
 */
export const downloadImportTemplate = (filename: string = 'user_import_template.xlsx'): void => {
  const templateData = [
    {
      'Username': 'john_doe',
      'Full Name': 'John Doe',
      'Email': 'john.doe@example.com',
      'Gender': 'Male',
      'Phone Number': '+91-9876543210',
      'Street': '123 Main Street',
      'City': 'Mumbai',
      'State': 'Maharashtra',
      'Pincode': '400001',
      'Office Location': 'Mumbai Office',
      'Assigned Under': 'USER001',
      'Role': 'User',
      'Assigned Regions': 'Maharashtra, Gujarat',
      'Status': 'Active',
      'Company': 'Jio',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 25 },
    { wch: 10 },
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 20 },
    { wch: 20 },
    { wch: 12 },
    { wch: 30 },
    { wch: 10 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'User Template');

  XLSX.writeFile(workbook, filename);
};

