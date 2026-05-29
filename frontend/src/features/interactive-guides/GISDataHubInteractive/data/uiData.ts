import {
  DataType,
  ExportFormat,
  InfrastructureCategory,
  CustomerCompany,
  AccessMethod,
  StorageComparisonRow,
} from "../types";

export const dataTypes: DataType[] = [
  {
    name: "Distance",
    icon: "📏",
    color: "blue",
    desc: "Measurement lines with coordinates",
  },
  {
    name: "Polygon",
    icon: "📐",
    color: "green",
    desc: "Area drawings with vertices",
  },
  {
    name: "Circle",
    icon: "⭕",
    color: "yellow",
    desc: "Radius coverage areas",
  },
  {
    name: "RF Sector",
    icon: "📡",
    color: "orange",
    desc: "Antenna sector coverage",
  },
  {
    name: "Elevation",
    icon: "📈",
    color: "purple",
    desc: "Terrain elevation profiles",
  },
  {
    name: "Infrastructure",
    icon: "🏗️",
    color: "red",
    desc: "POPs, Towers, Buildings",
  },
  {
    name: "Customer",
    icon: "👥",
    color: "cyan",
    desc: "Customer site locations",
  },
  {
    name: "Temporary",
    icon: "⏱️",
    color: "gray",
    desc: "Temporary session data",
  },
];

export const exportFormats: ExportFormat[] = [
  { name: "KML", icon: "📄", desc: "Google Earth compatible", color: "green" },
  { name: "CSV", icon: "📊", desc: "Spreadsheet format", color: "blue" },
  {
    name: "Excel",
    icon: "📈",
    desc: "Formatted .xlsx workbook",
    color: "purple",
  },
  { name: "PDF", icon: "📋", desc: "Printable report", color: "red" },
];

export const infrastructureCategories: InfrastructureCategory[] = [
  { name: "POP", icon: "🔴", desc: "Point of Presence" },
  { name: "Sub POP", icon: "🟢", desc: "Sub Point of Presence" },
  {
    name: "BTS CO-LO",
    icon: "🟠",
    desc: "Base Transceiver Station Co-Location",
  },
  { name: "Bandwidth BTS", icon: "🟣", desc: "Bandwidth Base Station" },
  { name: "Office Location", icon: "🟡", desc: "Office Premises" },
  { name: "NNI", icon: "🔵", desc: "Network to Network Interface" },
  { name: "Data Center", icon: "🟤", desc: "Data Center Facility" },
  { name: "Customer", icon: "🔵", desc: "Customer Site" },
];

export const customerCompanies: CustomerCompany[] = [
  { name: "Jio", icon: "📱", full: "Reliance Jio Infocomm Limited" },
  { name: "Vi", icon: "📶", full: "Vodafone Idea Limited" },
  { name: "SIFY", icon: "💻", full: "SIFY Technologies Limited" },
  { name: "Tata", icon: "🌐", full: "Tata Communications Limited" },
  { name: "Airtel", icon: "📞", full: "Bharti Airtel Limited" },
];

export const accessMethods: AccessMethod[] = [
  {
    number: "1️⃣",
    title: "Main Navigation",
    desc: "Click 'GIS Data Hub' in top nav bar",
    color: "blue",
  },
  {
    number: "2️⃣",
    title: "From Map Tools",
    desc: "Save → 'View in Data Hub' link",
    color: "green",
  },
  {
    number: "3️⃣",
    title: "Layer Manager",
    desc: "Map Layers → 'Manage Data' button",
    color: "purple",
  },
  {
    number: "4️⃣",
    title: "Dashboard",
    desc: "Dashboard → 'View All Data' card",
    color: "orange",
  },
  {
    number: "5️⃣",
    title: "Infrastructure Tool",
    desc: "Infra Management → 'View in Data Hub'",
    color: "pink",
  },
  {
    number: "6️⃣",
    title: "User Profile",
    desc: "Profile → 'My Saved Data' section",
    color: "teal",
  },
  {
    number: "7️⃣",
    title: "Global Search",
    desc: "Search → Jump to item → View in Data Hub",
    color: "indigo",
  },
];

export const storageComparison: StorageComparisonRow[] = [
  {
    feature: "Storage Location",
    permanent: "My Data (persistent in-app)",
    temporary: "Temporary session storage",
  },
  {
    feature: "Duration",
    permanent: "Persistent until removed",
    temporary: "Session / temporary",
  },
  {
    feature: "Visibility",
    permanent: "Available to permitted users",
    temporary: "Current user only",
  },
  {
    feature: "Survives Refresh",
    permanent: "✅ Yes",
    temporary: "✅ Yes (session)",
  },
  { feature: "Survives Close", permanent: "✅ Yes", temporary: "❌ No" },
  {
    feature: "Change History",
    permanent: "Recorded",
    temporary: "Not recorded",
  },
  { feature: "Exportable", permanent: "✅ All formats", temporary: "Limited" },
  {
    feature: "Real-time Sync",
    permanent: "Supported",
    temporary: "Local only",
  },
  {
    feature: "Use Case",
    permanent: "Production/Shared data",
    temporary: "Testing/Preview",
  },
];

export const proTips = [
  {
    title: "🎯 Use Tabs for Quick Navigation",
    content:
      "Click data type tabs or summary cards at the top to instantly filter to specific data types",
  },
  {
    title: "🔍 Combine Multiple Filters",
    content:
      "Stack search, ownership, category, and company filters to create precise data subsets",
  },
  {
    title: "💾 Convert Temporary Data Early",
    content:
      "Convert important temporary data to permanent as soon as possible",
  },
  {
    title: "📥 Regular Data Backups",
    content: "Export critical data regularly using the bulk export feature",
  },
  {
    title: "👁️ Use View Before Edit",
    content:
      "Always view item details before editing to see the complete picture",
  },
  {
    title: "🗺️ Map Integration",
    content: "Use View on Map button to visualize item location before changes",
  },
  {
    title: "📊 Monitor Statistics",
    content: "Monitor summary cards to track data growth and distribution",
  },
  {
    title: "🔐 Respect Permissions",
    content:
      "Regular users see their own data; request elevated access if needed",
  },
];

export const useCases = [
  {
    title: "📊 Data Review",
    desc: "Review saved measurements, drawings, and infrastructure items in one centralized location",
  },
  {
    title: "🔍 Quick Search",
    desc: "Search across data types to quickly find specific items",
  },
  {
    title: "📥 Data Export",
    desc: "Export data in KML, CSV, Excel, or PDF formats for sharing or offline use",
  },
  {
    title: "💾 Storage Management",
    desc: "Convert temporary session data to permanent saved items before it expires",
  },
  {
    title: "👥 Team Collaboration",
    desc: "Admins/Managers can view and manage team data in one place",
  },
  {
    title: "🗑️ Bulk Operations",
    desc: "Select multiple items and perform bulk delete or export operations with confirmation",
  },
];

