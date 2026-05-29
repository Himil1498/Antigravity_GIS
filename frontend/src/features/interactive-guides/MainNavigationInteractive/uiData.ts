import {
  NavigationTab,
  Role,
  GISTool,
  KeyFeature,
  ProTip,
  QuickRefItem,
} from "./types";

// Navigation tabs data (8 tabs)
export const navigationTabs: NavigationTab[] = [
  {
    name: "Map",
    icon: "🗺️",
    color: "green",
    access: "All",
    desc: "Default landing page with GIS tools",
  },
  {
    name: "GIS Data Hub",
    icon: "🗂️",
    color: "blue",
    access: "All",
    desc: "Import/Export data center",
  },
  {
    name: "Network Planning",
    icon: "🌐",
    color: "indigo",
    access: "All",
    desc: "Feasibility reviews & network catalog",
  },
  {
    name: "Dashboard",
    icon: "📈",
    color: "cyan",
    access: "All",
    desc: "KPIs and statistics overview",
  },
  {
    name: "Users",
    icon: "👥",
    color: "pink",
    access: "Admin/Manager",
    desc: "User account management",
  },
  {
    name: "Groups",
    icon: "👥",
    color: "violet",
    access: "Admin/Manager",
    desc: "Team and group management",
  },
  {
    name: "Admin",
    icon: "⚙️",
    color: "red",
    access: "Admin Only",
    desc: "System administration panel",
  },
  {
    name: "Analytics",
    icon: "📊",
    color: "teal",
    access: "All",
    desc: "Reports and analytics",
  },
];

// Roles data (4 roles)
export const roles: Role[] = [
  {
    name: "Admin",
    icon: "👑",
    color: "red",
    access: "Full Access",
    tabs: 8,
    permissions: [
      "Access all 8 navigation tabs",
      "Create/Edit/Delete all data",
      "Manage users and assign roles",
      "Assign regions to users",
      "View complete audit logs",
      "Modify system settings",
      "Approve region requests",
      "Grant temporary access",
    ],
  },
  {
    name: "Manager",
    icon: "👔",
    color: "orange",
    access: "Most Access",
    tabs: 7,
    permissions: [
      "Access 7 tabs (no Admin panel)",
      "Create/Edit/Delete own + team data",
      "View all users' data",
      "Limited user management",
      "Cannot access system settings",
      "View analytics and reports",
      "Manage team members",
      "Export team data",
    ],
  },
  {
    name: "Technician",
    icon: "🔧",
    color: "blue",
    access: "GIS Tools",
    tabs: 4,
    permissions: [
      "Access Map, Data Hub, Flow, Dashboard",
      "Create/Edit/Delete own data only",
      "Use all GIS tools",
      "View own analytics (read-only)",
      "Cannot manage users",
      "Export own data",
      "Import KML/CSV files",
      "Create infrastructure items",
    ],
  },
  {
    name: "Viewer",
    icon: "👁️",
    color: "gray",
    access: "Read-Only",
    tabs: 4,
    permissions: [
      "View-only access to 4 tabs",
      "View assigned regions only",
      "Cannot create/edit/delete",
      "Cannot export data",
      "No user management access",
      "View infrastructure on map",
      "View statistics (read-only)",
      "Access system documentation",
    ],
  },
];

// GIS tools data (5 tools) + Network Features
export const gisTools: GISTool[] = [
  {
    name: "Distance Measurement",
    icon: "📏",
    color: "blue",
    desc: "Measure distances between points on map",
  },
  {
    name: "Elevation Profile",
    icon: "📊",
    color: "green",
    desc: "View terrain elevation along a path",
  },
  {
    name: "Polygon Drawing",
    icon: "🔺",
    color: "purple",
    desc: "Draw and calculate polygon areas",
  },
  {
    name: "Circle Drawing",
    icon: "⭕",
    color: "orange",
    desc: "Draw circles with radius measurement",
  },
  {
    name: "RF Sector Tool",
    icon: "📡",
    color: "pink",
    desc: "Create telecom coverage sectors",
  },
  {
    name: "Network Catalog",
    icon: "🌐",
    color: "indigo",
    desc: "Browse infrastructure/customer data folders",
  },
];

// Key features data (4 features)
export const keyFeatures: KeyFeature[] = [
  {
    title: "Smart Map Loading",
    icon: "🗺️",
    color: "blue",
    points: [
      "Loads only visible markers",
      "Handles 100K+ items smoothly",
      "Auto-refreshes on pan/zoom",
      "Fast and efficient performance",
    ],
  },
  {
    title: "Real-Time Updates",
    icon: "🔄",
    color: "green",
    points: [
      "Instant synchronization",
      "Cross-user updates",
      "Live notifications",
      "No refresh needed",
    ],
  },
  {
    title: "Role-Based Security",
    icon: "🔒",
    color: "red",
    points: [
      "4 distinct user roles",
      "Granular permissions",
      "Region-based access",
      "Complete audit trail",
    ],
  },
  {
    title: "Comprehensive GIS",
    icon: "🛠️",
    color: "purple",
    points: [
      "6 professional tools",
      "KML/CSV import/export",
      "Multi-layer support",
      "Google Maps integration",
    ],
  },
];

// Quick reference data
export const quickRefItems: QuickRefItem[] = [
  {
    icon: "🔑",
    title: "Default Landing",
    items: [
      "After Login: Map Page",
      "All Roles: Same landing",
      "Google Maps: India centered",
      "GIS Tools: Auto-loaded",
    ],
  },
  {
    icon: "📊",
    title: "Data Scale",
    items: [
      "100K+ Infrastructure items",
      "Smart viewport loading",
      "Automatic marker clustering",
      "Real-time synchronization",
    ],
  },
  {
    icon: "🔄",
    title: "Auto-Refresh",
    items: [
      "Dashboard: Every 60 seconds",
      "Notifications: Instant updates",
      "Map markers: On view change",
      "Activity feed: Live updates",
    ],
  },
];

// Pro tips data (8 tips)
export const proTips: ProTip[] = [
  {
    title: "🎯 Keyboard Shortcuts",
    content:
      "Use browser bookmarks for quick access to specific tabs. Bookmark /map, /dashboard, /analytics for instant navigation.",
  },
  {
    title: "🔍 Global Search",
    content:
      "Use the top-right search box to find anything across all modules - infrastructure, users, data, or settings.",
  },
  {
    title: "🔔 Enable Notifications",
    content:
      "Keep notifications enabled to get real-time alerts for region requests, system updates, and team actions.",
  },
  {
    title: "📊 Dashboard First",
    content:
      "Start your day with the Dashboard tab to see latest KPIs, recent activity, and system health at a glance.",
  },
  {
    title: "🗺️ Map Performance",
    content:
      "For best performance, zoom to your target region before enabling all layers. Viewport loading keeps things fast.",
  },
  {
    title: "👥 Role Management",
    content:
      "Admins: Regularly review user roles and region assignments in the Users tab to maintain proper access control.",
  },
  {
    title: "📈 Analytics Insights",
    content:
      "Export analytics reports weekly to track trends. Use 7-day, 30-day, and 90-day views for different perspectives.",
  },
  {
    title: "⚙️ System Settings",
    content:
      "Admins: Check the Admin panel weekly for pending region requests and review audit logs for security.",
  },
];

// Navigation flow diagram text
export const navigationFlowDiagram = `┌──────────────────────────────────────────────────────────────────┐
│ OPTICONNECT GIS - NAVIGATION FLOW                               │
└──────────────────────────────────────────────────────────────────┘

1. USER LOGS IN
   └─► Redirected to: /map (Map Page)
       └─► Default landing page for all users

2. TOP NAVIGATION BAR (8 Tabs)
   ├─► 🗺️ Map (Default/Active)
   ├─► 🗂️ GIS Data Hub
   ├─► 🌐 Network Planning (NEW!)
   ├─► 📈 Dashboard
   ├─► 👥 Users (Admin/Manager only)
   ├─► 👥 Groups (Admin/Manager only)
   ├─► ⚙️ Admin (Admin only)
   └─► 📊 Analytics

3. RIGHT SIDE ACTIONS
   ├─► 🔍 Search (Global)
   ├─► 🔔 Notifications (with badge)
   ├─► ❓ Help Menu
   │   ├─► Flow Diagrams (Interactive Guides)
   │   ├─► User Guide
   │   ├─► Keyboard Shortcuts
   │   └─► Contact Support
   └─► 👤 Profile Menu (Avatar dropdown)
       ├─► Profile
       ├─► Settings
       └─► Logout

4. ROLE-BASED ACCESS
   ├─► Admin: ✅ All 8 tabs (Full access)
   ├─► Manager: ✅ 7 tabs (No Admin panel)
   ├─► Technician: ✅ 5 tabs (Map, Data Hub, Network Planning, Dashboard, Analytics)
   └─► Viewer: 👁️ 5 tabs (Read-only access)

5. MAP PAGE FEATURES (Default)
   ├─► Google Maps with clustering
   ├─► GIS Tools Toolbar (5 core tools):
   │   ├─► 📏 Distance Measurement
   │   ├─► 📊 Elevation Profile
   │   ├─► 🔺 Polygon Drawing
   │   ├─► ⭕ Circle Drawing
   │   └─► 📡 RF Sector Tool
   ├─► Network Features:
   │   ├─► 🌐 Network Catalog Button
   │   │   └─► Browse Infrastructure & Customer folders
   │   ├─► ✅ Feasibility Panel
   │   │   └─► Create & manage feasibility reviews
   ├─► Layer Controls (toggle layers on/off)
   ├─► Live Coordinates Display
   └─► Map Controls (Zoom, 3D, Satellite/Roadmap)

6. NETWORK PLANNING TAB
   ├─► Feasibility Reviews Table
   │   ├─► Create new feasibility report
   │   ├─► Link to infrastructure nodes
   │   └─► Generate/Export reports
   └─► Infrastructure Manager
       ├─► Folder structure (Infrastructure/Customer)
       ├─► File uploads (KML, CSV, Shapefiles)
       └─► Category management

7. DONE! 🎉`;

// Access table data for role comparison
export const accessTableData = [
  {
    tab: "🗺️ Map",
    admin: "Full",
    manager: "Full",
    technician: "Full",
    viewer: "View",
  },
  {
    tab: "🗂️ GIS Data Hub",
    admin: "Full",
    manager: "Full",
    technician: "Full",
    viewer: "View",
  },
  {
    tab: "🌐 Network Planning",
    admin: "Full",
    manager: "Full",
    technician: "Full",
    viewer: "View",
  },
  {
    tab: "📈 Dashboard",
    admin: "Full",
    manager: "Full",
    technician: "Full",
    viewer: "View",
  },
  {
    tab: "👥 Users",
    admin: "Full",
    manager: "Full",
    technician: "No",
    viewer: "No",
  },
  {
    tab: "👥 Groups",
    admin: "Full",
    manager: "Full",
    technician: "No",
    viewer: "No",
  },
  {
    tab: "⚙️ Admin",
    admin: "Full",
    manager: "No",
    technician: "No",
    viewer: "No",
  },
  {
    tab: "📊 Analytics",
    admin: "Full",
    manager: "Full",
    technician: "View",
    viewer: "View",
  },
];

