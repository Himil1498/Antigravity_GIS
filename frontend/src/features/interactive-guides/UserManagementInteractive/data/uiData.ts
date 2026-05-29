import {
  Role,
  RowAction,
  BulkOperation,
  FormSection,
  ValidationRule,
  TableColumn,
} from '../types';

export const roles: Role[] = [
  {
    name: "Admin",
    icon: "🛡️",
    color: "red",
    desc: "Full system access, user management, all regions",
  },
  {
    name: "Manager",
    icon: "💼",
    color: "blue",
    desc: "Team management, assigned regions, reports",
  },
  {
    name: "Technician",
    icon: "🔧",
    color: "green",
    desc: "Technical operations, field work, data entry",
  },
  {
    name: "User",
    icon: "👤",
    color: "gray",
    desc: "Basic access, view-only, limited permissions",
  },
];

export const rowActions: RowAction[] = [
  {
    name: "View Details",
    icon: "👁️",
    color: "blue",
    desc: "Read-only modal with 4 info cards",
  },
  {
    name: "Manage Permissions",
    icon: "🔐",
    color: "violet",
    desc: "Granular permission checkboxes",
  },
  {
    name: "Verify Email",
    icon: "✅",
    color: "emerald",
    desc: "Manual verification (unverified only)",
  },
  {
    name: "Resend Email",
    icon: "📧",
    color: "indigo",
    desc: "Send new verification link",
  },
  {
    name: "Edit User",
    icon: "✏️",
    color: "amber",
    desc: "Modify user details and access",
  },
  {
    name: "Change Password",
    icon: "🔑",
    color: "blue",
    desc: "Admin password reset",
  },
  {
    name: "Delete User",
    icon: "🗑️",
    color: "red",
    desc: "Permanent removal with confirmation",
  },
];

export const bulkOperations: BulkOperation[] = [
  {
    name: "Bulk Activate",
    icon: "✅",
    color: "emerald",
    desc: "Set status='Active' for selected users",
  },
  {
    name: "Bulk Deactivate",
    icon: "🚫",
    color: "amber",
    desc: "Set status='Inactive' for selected users",
  },
  {
    name: "Bulk Delete",
    icon: "🗑️",
    color: "red",
    desc: "Permanently remove selected users (confirmation required)",
  },
];

export const formSections: FormSection[] = [
  {
    num: 1,
    title: "Account Information",
    color: "blue",
    fields: ["Username*", "Email*", "Password*", "Confirm Password*"],
    notes: "Password visibility toggle, automatic uniqueness checks",
  },
  {
    num: 2,
    title: "Personal Information",
    color: "purple",
    fields: ["Full Name*", "Gender", "Phone Number*"],
    notes: "Indian phone format (+91-XXXXXXXXXX)",
  },
  {
    num: 3,
    title: "Address",
    color: "green",
    fields: ["Street", "City", "State", "Pincode"],
    notes: "36 Indian states/UTs dropdown, 6-digit pincode",
  },
  {
    num: 4,
    title: "Work Information & Access",
    color: "orange",
    fields: ["Department", "Office", "Role*", "Status*", "Assigned Regions"],
    notes: "Multi-select regions with search, role-based access",
  },
];

export const validationRules: ValidationRule[] = [
  { field: "Username", rule: "3-50 chars, lowercase, no spaces, unique" },
  { field: "Email", rule: "Valid format, uniqueness checked automatically" },
  { field: "Password", rule: "8+ chars, 1 uppercase, 1 lowercase, 1 number" },
  { field: "Confirm Password", rule: "Must exactly match password" },
  { field: "Name", rule: "Required, 2-100 characters" },
  { field: "Phone", rule: "+91-XXXXXXXXXX format (10 digits)" },
  { field: "Pincode", rule: "Exactly 6 digits (if provided)" },
  { field: "Role", rule: "Required, one of 4 options" },
  { field: "Status", rule: "Required, Active or Inactive" },
];

export const tableColumns: TableColumn[] = [
  { num: 1, name: "Checkbox", desc: "Multi-select for bulk actions" },
  { num: 2, name: "User ID", desc: "Auto-generated unique identifier" },
  { num: 3, name: "Name", desc: "Full name display" },
  { num: 4, name: "Email", desc: "Email address with verification badge" },
  { num: 5, name: "Role", desc: "Colored badge: Admin/Manager/Technician/User" },
  { num: 6, name: "Status", desc: "Active (green) or Inactive (red) badge" },
  { num: 7, name: "Email Verification", desc: "Verified (green) or Unverified (amber)" },
  { num: 8, name: "Assigned Regions", desc: "Count + state names tooltip" },
  { num: 9, name: "Temporary Access", desc: "Temp regions with expiry countdown" },
];

