import { Step } from './types';

// Steps data for Layers Interactive Guide
export const steps: Step[] = [
  {
    id: 1,
    title: "Open Layers Panel",
    icon: "📊",
    color: "blue",
    action: "Click the Layers button in Map Toolbar",
    result: "Dropdown panel opens showing all available layers",
    details: [
      "Location: Top-left of map, next to GIS Tools button",
      "Button displays: 📊 Layers",
      "Click to toggle dropdown open/close",
      "Panel shows user filter (Admin/Manager) and all layers",
      "Click outside to close the panel"
    ]
  },
  {
    id: 2,
    title: "User Filter (Admin/Manager Only)",
    icon: "👤",
    color: "purple",
    action: "Select which user's data to view",
    result: "Map displays data from selected user or all users",
    details: [
      "3 Filter Options Available:",
      "  1. 🔵 My Data - Show only YOUR data (default)",
      "  2. 🟢 All Users - Show data from ALL users combined",
      "  3. 👤 Specific User - Select individual user from dropdown",
      "",
      "User Dropdown Shows:",
      "  • User name with role icon (👑 Admin, 👔 Manager, 👤 User)",
      "  • Email address",
      "  • Current role",
      "",
      "When Filter Changes:",
      "  • Map refreshes automatically",
      "  • All layers reload with filtered data",
      "  • Infrastructure markers update",
      "  • Layer counts update (Distance, Polygon, etc.)",
      "",
      "Note: Regular users (non-admin/manager) only see their own data"
    ]
  },
  {
    id: 3,
    title: "Distance Measurements Layer",
    icon: "📏",
    color: "green",
    action: "Toggle Distance measurements visibility",
    result: "Show/hide all distance measurement lines on map",
    details: [
      "Shows: Blue polylines between points",
      "Layer Count: Displays number of measurements (e.g., Distance (25))",
      "Toggle: Click checkbox to show/hide",
      "When Visible:",
      "  • All distance lines appear on map",
      "  • Each line shows start/end markers",
      "  • Click line to view details (distance, elevation)",
      "When Hidden:",
      "  • All distance lines removed from map",
      "  • Data remains saved for later viewing",
      "Respects user filter setting"
    ]
  },
  {
    id: 4,
    title: "Polygon Drawings Layer",
    icon: "⬡",
    color: "cyan",
    action: "Toggle Polygon drawings visibility",
    result: "Show/hide all polygon shapes on map",
    details: [
      "Shows: Colored polygon shapes with borders",
      "Layer Count: Displays number of polygons (e.g., Polygon (15))",
      "Toggle: Click checkbox to show/hide",
      "When Visible:",
      "  • All polygon shapes appear on map",
      "  • Each polygon has fill color and border",
      "  • Area label displayed inside polygon",
      "  • Click polygon to view details (area, perimeter)",
      "When Hidden:",
      "  • All polygons removed from map",
      "  • Data remains saved for later viewing",
      "Respects user filter setting"
    ]
  },
  {
    id: 5,
    title: "Circle Drawings Layer",
    icon: "○",
    color: "orange",
    action: "Toggle Circle drawings visibility",
    result: "Show/hide all circle shapes on map",
    details: [
      "Shows: Circular shapes with radius",
      "Layer Count: Displays number of circles (e.g., Circle (8))",
      "Toggle: Click checkbox to show/hide",
      "When Visible:",
      "  • All circles appear on map",
      "  • Each circle has fill color and border",
      "  • Center marker visible",
      "  • Radius label displayed",
      "  • Click circle to view details (radius, area)",
      "When Hidden:",
      "  • All circles removed from map",
      "  • Data remains saved for later viewing",
      "Respects user filter setting"
    ]
  },
  {
    id: 6,
    title: "Elevation Profiles Layer",
    icon: "⛰️",
    color: "pink",
    action: "Toggle Elevation profile lines visibility",
    result: "Show/hide all elevation measurement lines",
    details: [
      "Shows: Colored lines with elevation markers",
      "Layer Count: Displays number of profiles (e.g., Elevation (12))",
      "Toggle: Click checkbox to show/hide",
      "When Visible:",
      "  • All elevation lines appear on map",
      "  • Start/end markers with elevation values",
      "  • Gradient color shows elevation change",
      "  • Click line to view elevation graph",
      "When Hidden:",
      "  • All elevation lines removed from map",
      "  • Data remains saved for later viewing",
      "Respects user filter setting"
    ]
  },
  {
    id: 7,
    title: "Infrastructure Layer",
    icon: "📡",
    color: "indigo",
    action: "Toggle Infrastructure items visibility",
    result: "Show/hide all infrastructure markers (POPs, Towers, etc.)",
    details: [
      "Shows: All infrastructure markers on map",
      "Layer Count: Displays total items (e.g., Infrastructure (5,420))",
      "Toggle: Click checkbox to show/hide",
      "Infrastructure Types Included:",
      "  🔴 POP (Point of Presence)",
      "  🟠 SubPOP",
      "  🔵 Tower/BTS",
      "  🟢 Building/Office",
      "  🟣 Customer sites",
      "  🟡 Fiber routes",
      "  🩷 Junction boxes",
      "",
      "When Visible:",
      "  • All markers appear with color coding",
      "  • Marker clustering enabled (1000+ items)",
      "  • Click marker to view details",
      "When Hidden:",
      "  • All infrastructure hidden",
      "  • Map shows only GIS layers",
      "Respects user filter setting"
    ]
  },
  {
    id: 8,
    title: "RF Sector Layer",
    icon: "📶",
    color: "red",
    action: "Toggle RF Sector coverage visibility",
    result: "Show/hide all RF sector coverage areas",
    details: [
      "Shows: Sector coverage wedges from towers",
      "Layer Count: Displays number of sectors (e.g., Sector RF (45))",
      "Toggle: Click checkbox to show/hide",
      "When Visible:",
      "  • All RF sectors appear as wedge shapes",
      "  • Each sector shows:",
      "    - Tower location (center point)",
      "    - Azimuth direction (angle)",
      "    - Beamwidth (coverage arc)",
      "    - Radius (signal range)",
      "    - Color coding by frequency/type",
      "  • Click sector to view technical details",
      "When Hidden:",
      "  • All RF sectors removed from map",
      "  • Data remains saved for later viewing",
      "Respects user filter setting"
    ]
  },
  {
    id: 9,
    title: "Layer Toggle All",
    icon: "🔄",
    color: "yellow",
    action: "Quickly show or hide all layers at once",
    result: "All layers toggled on or off together",
    details: [
      "Convenience Feature:",
      "  • Toggle all layers with one click",
      "  • If any layer is visible → Hide all",
      "  • If all layers are hidden → Show all",
      "",
      "Use Cases:",
      "  • Clean map view (hide all)",
      "  • See complete picture (show all)",
      "  • Performance: Hide layers when map is slow",
      "  • Focus on specific data",
      "",
      "Note: Checkbox states update automatically",
      "Note: User filter still applies to all layers"
    ]
  }
];

// Pro tips data
export const proTips = [
  { label: "Performance", content: "Hide unused layers to improve map performance with large datasets." },
  { label: "User Filter", content: "Admin/Manager can view and compare data from different team members." },
  { label: "Layer Counts", content: "Numbers in parentheses show how many items exist in each layer." },
  { label: "Persistence", content: "Layer visibility settings are saved per user session." }
];

