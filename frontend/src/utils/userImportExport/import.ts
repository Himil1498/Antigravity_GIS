
import * as XLSX from 'xlsx';
import type { User } from '../../types/auth/index';

/**
 * Parse imported Excel file to user data
 */
export const parseImportedFile = async (file: File): Promise<{
  users: Partial<User>[];
  errors: string[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const users: Partial<User>[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          try {
            // Validate required fields
            if (!row['Username']) {
              errors.push(`Row ${index + 2}: Username is required`);
              return;
            }
            if (!row['Email']) {
              errors.push(`Row ${index + 2}: Email is required`);
              return;
            }

            // Parse user data
            const user: Partial<User> = {
              username: row['Username'],
              name: row['Full Name'],
              email: row['Email'],
              gender: row['Gender'] || '',
              phoneNumber: row['Phone Number'] || '',
              address: {
                street: row['Street'] || '',
                city: row['City'] || '',
                state: row['State'] || '',
                pincode: row['Pincode'] || '',
              },
              officeLocation: row['Office Location'] || '',
              assignedUnder: row['Assigned Under']
                ? row['Assigned Under'].split(',').map((s: string) => s.trim())
                : [],
              role: (row['Role']?.toLowerCase() || 'user') as 'admin' | 'manager' | 'technician' | 'user',
              assignedRegions: row['Assigned Regions']
                ? row['Assigned Regions'].split(',').map((s: string) => s.trim())
                : [],
              status: (row['Status'] || 'Active') as 'Active' | 'Inactive',
              company: row['Company'] || '',
              password: '', // Will be set by backend
            };

            users.push(user);
          } catch (error) {
            errors.push(`Row ${index + 2}: Invalid data format - ${error}`);
          }
        });

        resolve({ users, errors });
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
};

