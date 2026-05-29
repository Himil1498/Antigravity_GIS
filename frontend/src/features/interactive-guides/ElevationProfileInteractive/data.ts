import { Step, VisualElement, StorageComparisonRow, AccessMethod } from './types';

export const steps: Step[] = [
  {
    id: 1,
    title: "Open Tool",
    icon: "🎯",
    color: "purple",
    action: "Click 'Elevation Profile Tool' button in Map toolbar",
    result: "Tool panel appears, cursor changes to crosshair (+)",
    details: [
      "Navigate to Map Page",
      "Click on 'Elevation Profile Tool' button in toolbar",
      "Or select from GIS Tools dropdown menu",
      "Tool panel overlay appears on map",
      "Status: 'Click two points on map to create elevation profile'"
    ]
  },
  {
    id: 2,
    title: "Mark Point A (Start)",
    icon: "📍",
    color: "green",
    action: "Click anywhere on map to place first point",
    result: "Green marker 'A' appears with coordinates captured",
    details: [
      "Click anywhere on the map",
      "Green marker appears with label 'A'",
      "Coordinates captured: { lat, lng }",
      "Status updates: 'Click second point to complete elevation profile'",
      "Cursor remains as crosshair for second click"
    ]
  },
  {
    id: 3,
    title: "Mark Point B (End)",
    icon: "📍",
    color: "red",
    action: "Click second location on map",
    result: "Red marker 'B' appears, blue polyline connects A→B",
    details: [
      "Click second location → Point B marker appears (red)",
      "Blue polyline (4px) drawn connecting A → B",
      "Distance calculated automatically",
      "Bearing/Azimuth calculated (0-360°)",
      "Status: 'Fetching elevation data...'",
      "Elevation data retrieved with high precision (512 samples)"
    ]
  },
  {
    id: 4,
    title: "View Elevation Graph",
    icon: "📊",
    color: "blue",
    action: "Elevation data fetched and graph displays automatically",
    result: "Interactive Chart.js line graph shows elevation profile",
    details: [
      "Chart.js line graph displays with gradient fill",
      "X-axis: Distance (km), Y-axis: Elevation (m)",
      "Blue gradient fill under the line",
      "High point marked with red dot (🔴)",
      "Low point marked with blue dot (🔵)",
      "Grid lines for easy reading",
      "Interactive hover enabled by default"
    ]
  },
  {
    id: 5,
    title: "View Statistics",
    icon: "📈",
    color: "indigo",
    action: "Automatically calculated metrics display in info panel",
    result: "Complete elevation analysis shown",
    details: [
      "📏 Total Distance: XX.XX km",
      "⬆️ Elevation Gain: +XX m (total uphill)",
      "⬇️ Elevation Loss: -XX m (total downhill)",
      "🔴 High Point: XX.X m at X.XX km",
      "🔵 Low Point: XX.X m at X.XX km",
      "🧭 Bearing A→B: XX.X° (e.g., Northeast)",
      "🧭 Bearing B→A: XX.X° (reverse direction)"
    ]
  },
  {
    id: 6,
    title: "View Bearing/Azimuth",
    icon: "🧭",
    color: "pink",
    action: "Bearing arcs automatically display on map",
    result: "Visual compass directions shown at both points",
    details: [
      "🟢 Green arc at Point A with degree label",
      "🔴 Red arc at Point B with reverse bearing",
      "⬆️ Gray dashed North reference lines",
      "Arc radius: 12% of distance (max 500m)",
      "Example: A→B 45.2° (Northeast), B→A 225.2° (Southwest)",
      "Used for telecom antenna alignment, RF planning"
    ]
  },
  {
    id: 7,
    title: "Graph Hover (Interactive)",
    icon: "🖱️",
    color: "orange",
    action: "Move cursor over elevation graph",
    result: "Orange marker appears on map showing exact location",
    details: [
      "Hover over any point on the graph",
      "Tooltip shows: Distance, Elevation, Coordinates",
      "🟡 Orange marker appears on map at exact location",
      "📍 InfoWindow displays elevation and distance",
      "Real-time sync between graph and map",
      "Click graph to lock marker position",
      "Toggle hover enable/disable switch available"
    ]
  },
  {
    id: 8,
    title: "Enable 3D View (Optional)",
    icon: "🎬",
    color: "teal",
    action: "Click 'Enable 3D View' button",
    result: "Map switches to 3D terrain mode with tilted camera",
    details: [
      "🗺️ Map switches to 3D terrain mode",
      "🏔️ Terrain elevation visible (mountains, valleys)",
      "📐 Camera tilts to 45° angle",
      "🔄 Map rotates to align with profile direction",
      "🎨 Polyline overlaid on 3D terrain",
      "Controls: Rotate, Tilt, Reset, Exit 3D"
    ]
  },
  {
    id: 9,
    title: "LOS Analysis (Advanced)",
    icon: "📡",
    color: "orange",
    action: "Enable LOS Analysis and configure parameters",
    result: "Line of Sight analysis with Fresnel zones displayed",
    details: [
      "Click 'Enable LOS Analysis' button",
      "Set Antenna Height 1 (Point A): Default 30m",
      "Set Antenna Height 2 (Point B): Default 30m",
      "Set RF Frequency: Default 2400 MHz",
      "Click 'Analyze' button",
      "System retrieves building obstruction data",
      "Shows: CLEAR or OBSTRUCTED status",
      "Displays clearance value and recommendations"
    ]
  },
  {
    id: 10,
    title: "Save Profile",
    icon: "💾",
    color: "cyan",
    action: "Click Save button and enter profile details",
    result: "Save dialog opens with storage options",
    details: [
      "Click 'Save' button",
      "Enter Profile Name (required)",
      "Add Description (optional)",
      "View calculated metrics summary",
      "Choose storage type: Permanent or Temporary",
      "Permanent: Saved forever, accessible from all devices",
      "Temporary: Available only during current session"
    ]
  },
  {
    id: 11,
    title: "Access Saved Data",
    icon: "📂",
    color: "violet",
    action: "Retrieve saved profiles from multiple locations",
    result: "View, edit, or export elevation profile data",
    details: [
      "GIS Data Hub → My Data → Elevation Profiles",
      "Map Layers → Toggle 'Elevation Profiles' ON",
      "Elevation Tool → Load Saved dropdown",
      "Global Search → Type profile name",
      "Export as KML/CSV/Excel/GPX"
    ]
  }
];

export const visualElements: VisualElement[] = [
  { icon: "📍", title: "Marker A", description: "Green marker with 'A' label at start point" },
  { icon: "📍", title: "Marker B", description: "Red marker with 'B' label at end point" },
  { icon: "🔵", title: "Blue Polyline", description: "4px stroke connecting A → B" },
  { icon: "🧭", title: "Bearing Arc A", description: "Green arc showing direction (0-360°)" },
  { icon: "🧭", title: "Bearing Arc B", description: "Red arc showing reverse direction" },
  { icon: "🔴", title: "High Point", description: "Purple marker at highest elevation" },
  { icon: "🔵", title: "Low Point", description: "Cyan marker at lowest elevation" },
  { icon: "🟡", title: "Hover Marker", description: "Orange marker synced with graph hover" }
];

export const storageComparison: StorageComparisonRow[] = [
  { feature: "Duration", permanent: "Saved Forever", temporary: "Current session only" },
  { feature: "Access", permanent: "All your devices", temporary: "This browser only" },
  { feature: "Share with team", permanent: "✅ Yes", temporary: "❌ No" },
  { feature: "Edit Later", permanent: "✅ Anytime", temporary: "❌ View only" },
  { feature: "Export", permanent: "✅ KML/CSV/Excel/GPX", temporary: "❌ Not available" },
  { feature: "LOS Data", permanent: "✅ Saved", temporary: "❌ Lost on close" },
  { feature: "Best For", permanent: "Network planning", temporary: "Quick testing" }
];

export const accessMethods: AccessMethod[] = [
  { number: "1️⃣", title: "GIS Data Hub", description: "Data Hub → My Data → Elevation Profiles section", color: "blue" },
  { number: "2️⃣", title: "Map Layers Panel", description: "Map page → Layers button → Toggle 'Elevation Profiles' ON", color: "green" },
  { number: "3️⃣", title: "Load from Tool", description: "Open Elevation Tool → Load Saved dropdown → Select profile", color: "purple" },
  { number: "4️⃣", title: "Global Search", description: "Search box → Type profile name → Click result", color: "orange" },
  { number: "5️⃣", title: "Export Data", description: "Data Hub → Export → Choose format: KML/CSV/Excel/GPX", color: "teal" }
];

