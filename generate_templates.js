const XLSX = require('xlsx');
const path = require('path');

// Only the headings as a single row for data entry
const popHeaders = [
  "POP ID", "POP Type", "Site ID", "Infra Provider", "RL Number", 
  "Region", "Country", "State", "District", "City / Village", 
  "Area", "BTS Type", "Tower Height", "Power Source", 
  "UPS Capacity", "Backup Capacity", "SPOC Name", "SPOC Number"
];

const customerHeaders = [
  "Circuit ID", "Circuit Name", "Circuit Status", "Product Type", 
  "Activation Date", "Connected State/UT", "Connected POP", "Bandwidth", 
  "ERP POP Code", "System POP Code", "Media Type", "Physical Address", 
  "Region", "State", "District", "City / Village", "Pincode"
];

// Create workbook
const wb = XLSX.utils.book_new();

// Create sheets with only headers in the first row
const wsPop = XLSX.utils.aoa_to_sheet([popHeaders]);
const wsCustomer = XLSX.utils.aoa_to_sheet([customerHeaders]);

// Add sheets to workbook
XLSX.utils.book_append_sheet(wb, wsPop, "POP_Data_Entry");
XLSX.utils.book_append_sheet(wb, wsCustomer, "Customer_Data_Entry");

// Save to root
const filePath = path.join(__dirname, 'Form_Templates.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Excel file updated with only headers at: ${filePath}`);
