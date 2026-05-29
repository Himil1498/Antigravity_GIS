import { Step } from './types';

// Steps 6-10: Adjust Radius to Access Saved Data
export const stepsSecondHalf: Step[] = [
  {
    id: 6,
    title: "Adjust Radius",
    icon: "📏",
    color: "pink",
    action: "Change coverage distance from tower (100m-50km)",
    result: "Sector extends or shrinks with metrics updated",
    details: [
      "📏 Radius = Maximum coverage distance",
      "📡 How far the RF signal reaches",
      "🎯 Default: 1000m (1 km)",
      "Range: 100m to 50000m (50 km)",
      "Type radius in meters in input field",
      "Or use slider (if available)",
      "✅ Sector extends/shrinks instantly",
      "📊 Coverage area: (π × r² × beamwidth) / 360°",
      "📏 Arc length: (2 × π × r × beamwidth) / 360°"
    ]
  },
  {
    id: 7,
    title: "Customize Appearance",
    icon: "🎨",
    color: "orange",
    action: "Change color and opacity for visual clarity",
    result: "Sector updates with new styling",
    details: [
      "🎨 Click color swatch to open picker",
      "🎨 Select RGB/Hex color",
      "🟠 Default: Orange (#FF5722)",
      "✅ Changes both fill & stroke color",
      "💧 Adjust opacity slider (0-100%)",
      "💧 Default: 40% transparency",
      "Color coding examples:",
      "🔴 Red: 2G | 🟠 Orange: 3G",
      "🔵 Blue: 4G | 🟣 Purple: 5G"
    ]
  },
  {
    id: 8,
    title: "RF Technical Details",
    icon: "📡",
    color: "teal",
    action: "Add RF specifications (frequency, technology, etc.)",
    result: "Complete technical metadata attached to sector",
    details: [
      "Click 'Show Advanced Options' to reveal:",
      "🗼 Tower Name: e.g., 'Tower-123'",
      "📡 Sector Name: e.g., 'Alpha-1'",
      "📻 Frequency: e.g., '1800 MHz', '2600 MHz'",
      "📱 Technology: 2G, 3G, 4G, 5G, Wi-Fi, Other",
      "📏 Antenna Height: e.g., '30m', '50m'",
      "⚡ Power (optional): Transmission power in watts",
      "📋 Status: Active, Inactive, Planned, Testing",
      "All fields saved with sector data"
    ]
  },
  {
    id: 9,
    title: "Save Sector",
    icon: "💾",
    color: "cyan",
    action: "Click Save button and choose storage type",
    result: "Save dialog opens with two storage options",
    details: [
      "Click 'Save' button in tool panel",
      "Enter Sector Name (required field)",
      "Add Description/Notes (optional)",
      "View calculated metrics summary",
      "Choose storage type:",
      "🔒 Permanent: Saved forever",
      "→ Includes all RF technical details",
      "→ Accessible from all devices",
      "⏰ Temporary: Current session only",
      "Click 'Save' to confirm"
    ]
  },
  {
    id: 10,
    title: "Access Saved Data",
    icon: "📂",
    color: "blue",
    action: "Retrieve sectors from multiple locations",
    result: "View, edit, or export RF sector data",
    details: [
      "1️⃣ GIS Data Hub → My Data → RF Sectors",
      "2️⃣ Map Layers → Toggle 'RF Sectors' ON",
      "3️⃣ RF Sector Tool → Load Saved dropdown",
      "4️⃣ Global Search → Type sector/tower name",
      "5️⃣ Export: KML/GeoJSON/CSV/Excel"
    ]
  }
];

