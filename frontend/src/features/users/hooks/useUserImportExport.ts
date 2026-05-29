import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { User } from '../../../types/auth/index';
import { showToast } from '../../../utils/toastUtils';

export const useUserImportExport = () => {
  /**
   * Export users to Excel with ALL details including permissions
   */
  const handleExport = useCallback((users: User[]) => {
    try {
      // 1. Flatten Data with ALL user fields
      const exportData = users.map((user) => ({
        'User ID': user.id || '',
        'User Name': user.username || '',
        'Full Name': user.name || '',
        'Email ID': user.email || '',
        'Mobile Number': user.phoneNumber || user.phone || '',
        'Gender': user.gender || '',
        'Street Address': user.address?.street || user.street || '',
        'City': user.address?.city || user.city || '',
        'State': user.address?.state || user.state || '',
        'Pincode': user.address?.pincode || user.pincode || '',
        'Department': user.department || '',
        'Role': user.role || '',
        'Office Location': user.officeLocation || '',
        'Assigned Regions': user.assignedRegions ? user.assignedRegions.join(', ') : '',
        'Assigned Under': user.assignedUnder ? user.assignedUnder.join(', ') : '',
        'Status': user.status || '',
        'Company': user.company || '',
        'Permissions': user.permissions && user.permissions.length > 0
          ? user.permissions.join(', ')
          : (user.directPermissions && user.directPermissions.length > 0
            ? user.directPermissions.join(', ')
            : ''),
        'Groups': user.groups ? user.groups.join(', ') : '',
        'Email Verified': user.isEmailVerified ? 'Yes' : 'No',
        'MFA Enabled': user.mfaEnabled ? 'Yes' : 'No',
        'MFA Method': user.mfaMethod || '',
        'Last Login': user.lastLogin
          ? new Date(user.lastLogin).toLocaleDateString('en-IN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })
          : '',
        'Created At': user.createdAt
          ? new Date(user.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            })
          : '',
      }));

      // 2. Create Worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // 3. Set column widths for readability
      ws['!cols'] = [
        { wch: 12 },  // User ID
        { wch: 16 },  // User Name
        { wch: 22 },  // Full Name
        { wch: 28 },  // Email ID
        { wch: 16 },  // Mobile Number
        { wch: 10 },  // Gender
        { wch: 25 },  // Street Address
        { wch: 15 },  // City
        { wch: 18 },  // State
        { wch: 10 },  // Pincode
        { wch: 16 },  // Department
        { wch: 14 },  // Role
        { wch: 20 },  // Office Location
        { wch: 30 },  // Assigned Regions
        { wch: 20 },  // Assigned Under
        { wch: 10 },  // Status
        { wch: 18 },  // Company
        { wch: 40 },  // Permissions
        { wch: 20 },  // Groups
        { wch: 14 },  // Email Verified
        { wch: 12 },  // MFA Enabled
        { wch: 12 },  // MFA Method
        { wch: 20 },  // Last Login
        { wch: 14 },  // Created At
      ];

      // 4. Create Workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      // 5. Download File
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Users_Export_${date}.xlsx`);
      
      showToast.success(`Exported ${users.length} users successfully!`);
    } catch (error) {
      console.error("Export failed:", error);
      showToast.error("Failed to export users");
    }
  }, []);

  /**
   * Download import template with all required fields
   */
  const handleImportTemplate = useCallback(() => {
    try {
      // Create a template with headers and example rows
      const templateData = [
        {
          'User Name': 'johndoe',
          'Full Name': 'John Doe',
          'Email ID': 'john.doe@example.com',
          'Password': 'Abc@1234',
          'Mobile Number': '9876543210',
          'Gender': 'Male',
          'Street Address': '123 Main Street',
          'City': 'Mumbai',
          'State': 'Maharashtra',
          'Pincode': '400001',
          'Department': 'IT',
          'Role': 'User',
          'Office Location': 'Mumbai Office',
        },
        {
          'User Name': 'janesmith',
          'Full Name': 'Jane Smith',
          'Email ID': 'jane.smith@example.com',
          'Password': 'Xyz@5678',
          'Mobile Number': '9123456789',
          'Gender': 'Female',
          'Street Address': '456 Park Avenue',
          'City': 'Delhi',
          'State': 'Delhi',
          'Pincode': '110001',
          'Department': 'Operations',
          'Role': 'Manager',
          'Office Location': 'Delhi Office',
        },
      ];

      const ws = XLSX.utils.json_to_sheet(templateData);

      // Set column widths for readability
      ws['!cols'] = [
        { wch: 16 },  // User Name
        { wch: 22 },  // Full Name
        { wch: 28 },  // Email ID
        { wch: 14 },  // Password
        { wch: 16 },  // Mobile Number
        { wch: 10 },  // Gender
        { wch: 25 },  // Street Address
        { wch: 15 },  // City
        { wch: 18 },  // State
        { wch: 10 },  // Pincode
        { wch: 16 },  // Department
        { wch: 14 },  // Role
        { wch: 20 },  // Office Location
      ];

      // Add a "Notes" sheet with instructions
      const notesData = [
        { 'Field': 'User Name', 'Description': 'Unique login username (required)', 'Example': 'johndoe' },
        { 'Field': 'Full Name', 'Description': 'Full display name (required)', 'Example': 'John Doe' },
        { 'Field': 'Email ID', 'Description': 'Valid email address (required, unique)', 'Example': 'john@example.com' },
        { 'Field': 'Password', 'Description': 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (required)', 'Example': 'Abc@1234' },
        { 'Field': 'Mobile Number', 'Description': '10-digit mobile number', 'Example': '9876543210' },
        { 'Field': 'Gender', 'Description': 'Male / Female / Other', 'Example': 'Male' },
        { 'Field': 'Street Address', 'Description': 'Street address line', 'Example': '123 Main Street' },
        { 'Field': 'City', 'Description': 'City name', 'Example': 'Mumbai' },
        { 'Field': 'State', 'Description': 'State name (Indian state)', 'Example': 'Maharashtra' },
        { 'Field': 'Pincode', 'Description': '6-digit postal pincode', 'Example': '400001' },
        { 'Field': 'Department', 'Description': 'Department or team name', 'Example': 'IT' },
        { 'Field': 'Role', 'Description': 'admin / manager / technician / user', 'Example': 'User' },
        { 'Field': 'Office Location', 'Description': 'Office location name', 'Example': 'Mumbai Office' },
      ];

      const notesWs = XLSX.utils.json_to_sheet(notesData);
      notesWs['!cols'] = [
        { wch: 18 },
        { wch: 55 },
        { wch: 20 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "User Template");
      XLSX.utils.book_append_sheet(wb, notesWs, "Instructions");

      XLSX.writeFile(wb, "User_Import_Template.xlsx");
      showToast.success("Import template downloaded!");
    } catch (error) {
       console.error("Template download failed:", error);
       showToast.error("Failed to download template");
    }
  }, []);

  return {
    handleExport,
    handleImportTemplate
  };
};
