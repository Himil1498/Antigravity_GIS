import { Step } from './types';

// Steps 1-5: Getting Started with Search
export const stepsFirstHalf: Step[] = [
  {
    id: 1,
    title: "Open Global Search",
    icon: "🔍",
    color: "blue",
    action: "Click the Search button in Map Toolbar",
    result: "Search panel expands showing input field and options",
    details: [
      "Location: Center-top of map, between Layers and Map Controls",
      "Button displays: 🔍 (search icon)",
      "Click to toggle search panel open/close",
      "Panel shows search input, type selector, and recent searches",
      "Click outside to close the panel"
    ]
  },
  {
    id: 2,
    title: "Choose Search Type",
    icon: "🎯",
    color: "purple",
    action: "Select what you want to search for",
    result: "Search behavior changes based on selected type",
    details: [
      "3 Search Types Available:",
      "  1. 🔍 Places - Search for locations, addresses, landmarks",
      "  2. 📍 Coordinates - Search by lat/long (e.g., 28.6139, 77.2090)",
      "  3. 💾 Saved Data - Search your saved GIS measurements",
      "",
      "Type Selection:",
      "  • Click any type button to switch modes",
      "  • Blue highlight shows active search type",
      "  • Search automatically updates when switching types",
      "",
      "Saved Data includes:",
      "  • Distance measurements",
      "  • Elevation profiles",
      "  • Polygon drawings",
      "  • Circle drawings",
      "  • RF Sectors",
      "  • Infrastructure items"
    ]
  },
  {
    id: 3,
    title: "Enter Search Query",
    icon: "⌨️",
    color: "green",
    action: "Type your search query in the input field",
    result: "Real-time search results appear as you type",
    details: [
      "Input Field Features:",
      "  • Auto-focuses when panel opens",
      "  • Minimum 2 characters to trigger search",
      "  • Results appear automatically as you type",
      "  • Press ENTER to search immediately",
      "  • Press ESC to close search panel",
      "",
      "Search Examples:",
      "  Places: \"New Delhi\", \"India Gate\", \"Connaught Place\"",
      "  Coordinates: \"28.6139, 77.2090\" or \"28.6139°N 77.2090°E\"",
      "  Saved Data: \"Tower A\", \"POP Mumbai\", \"Distance 123\"",
      "",
      "Accepted Coordinate Formats:",
      "  • Decimal: 28.6139, 77.2090",
      "  • With symbols: 28.6139° N, 77.2090° E",
      "  • With comma/space separator"
    ]
  },
  {
    id: 4,
    title: "User Filter (Admin/Manager Only)",
    icon: "👤",
    color: "orange",
    action: "Select which user's saved data to search",
    result: "Search results filtered to selected user's data",
    details: [
      "Only visible when:",
      "  • User role is Admin or Manager",
      "  • Search type is \"💾 Saved Data\"",
      "",
      "Filter Options:",
      "  • 👤 My Data - Search only YOUR saved data (default)",
      "  • Individual Users - Select from dropdown list",
      "",
      "User Dropdown Shows:",
      "  • User name with role icon (👑 Admin, 👔 Manager, 👤 User)",
      "  • Email address",
      "  • Current role",
      "",
      "When Filter Changes:",
      "  • Search automatically updates",
      "  • Results show selected user's data only",
      "  • Result count updates",
      "",
      "Note: Regular users (non-admin/manager) only see their own data"
    ]
  },
  {
    id: 5,
    title: "Elevation Data Filter",
    icon: "📊",
    color: "cyan",
    action: "Filter to show only measurements with elevation data",
    result: "Results limited to distance measurements with elevation profiles",
    details: [
      "Only visible when:",
      "  • Search type is \"💾 Saved Data\"",
      "",
      "How it works:",
      "  • Checkbox: \"📊 Only measurements with elevation data\"",
      "  • When checked, filters distance measurements",
      "  • Shows only items with elevation_data array populated",
      "  • Useful for finding elevation profiles and LOS analysis",
      "",
      "Badge Indicators in Results:",
      "  • 📊 Green badge - Has elevation data",
      "  • 👁️ LOS badge - Has Line of Sight analysis",
      "    - Green LOS - Clear line of sight",
      "    - Red LOS - Obstructed",
      "",
      "Elevation Stats Shown:",
      "  • ⛰️ Max elevation (meters)",
      "  • 🏞️ Min elevation (meters)",
      "  • 📐 Bearing angle (degrees)"
    ]
  }
];

