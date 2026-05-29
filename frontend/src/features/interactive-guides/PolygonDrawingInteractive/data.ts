import { Step, StorageComparisonRow, VisualElement, QuickAccessItem, ProTip } from './types';

// Steps data for Polygon Drawing Tool (8 steps)
export const steps: Step[] = [
  {
    id: 1,
    title: "Open Tool",
    icon: "🎯",
    color: "green",
    action: "Click 'Polygon Drawing Tool' button on Map",
    result: "Tool panel opens, cursor becomes crosshair (+)",
    details: [
      "Navigate to Map page",
      "Find Polygon Drawing Tool in sidebar",
      "Click to activate drawing mode",
      "Map ready for polygon creation"
    ]
  },
  {
    id: 2,
    title: "Draw Polygon",
    icon: "📐",
    color: "purple",
    action: "Click on map to place vertices (corners)",
    result: "Polygon shape forms, area & perimeter calculated",
    details: [
      "Vertex 1: Click anywhere → First marker appears",
      "Vertex 2: Click again → Line connects them",
      "Vertex 3+: Continue clicking → Polygon forms (auto-closed)",
      "Real-time calculations update with each click"
    ]
  },
  {
    id: 3,
    title: "Complete Drawing",
    icon: "✅",
    color: "blue",
    action: "Click 'Complete Drawing' button or press Enter",
    result: "Shape locked and ready to save",
    details: [
      "Click Complete Drawing button",
      "Or press Enter key",
      "Minimum 3 vertices required",
      "Markers become non-draggable",
      "Final area and perimeter calculated"
    ]
  },
  {
    id: 4,
    title: "Customize Appearance",
    icon: "🎨",
    color: "pink",
    action: "Adjust color and opacity settings",
    result: "Polygon appearance updates in real-time",
    details: [
      "Color Picker: Choose fill/stroke color (default: Red)",
      "Opacity Slider: 0-100% (default: 35%)",
      "Changes reflect instantly on map",
      "Settings saved with polygon"
    ]
  },
  {
    id: 5,
    title: "Edit (Optional)",
    icon: "✏️",
    color: "orange",
    action: "Use Undo or Clear buttons",
    result: "Vertices removed, polygon redraws",
    details: [
      "Undo: Remove last vertex one at a time",
      "Clear: Remove all vertices (with confirmation)",
      "Area and perimeter recalculate automatically",
      "Tool remains open for fresh start"
    ]
  },
  {
    id: 6,
    title: "Save Polygon",
    icon: "💾",
    color: "teal",
    action: "Click Save button",
    result: "Save dialog opens",
    details: [
      "Enter Polygon Name (required)",
      "Add Description/Notes (optional)",
      "View calculated area and perimeter",
      "Choose storage type"
    ]
  },
  {
    id: 7,
    title: "Choose Storage",
    icon: "🗄️",
    color: "indigo",
    action: "Select Permanent or Temporary storage",
    result: "Polygon data saved to chosen location",
    details: [
      "Permanent 🔒: Saved forever, accessible from all devices",
      "Temporary ⏰: Available only during current session",
      "Click Save to confirm",
      "Success notification appears"
    ]
  },
  {
    id: 8,
    title: "Access Data",
    icon: "📂",
    color: "violet",
    action: "Retrieve saved polygons anytime",
    result: "View, edit, or export your polygon data",
    details: [
      "GIS Data Hub → My Data → Polygons",
      "Map Layers → Toggle Polygon layer ON",
      "Polygon Tool → Load Saved dropdown",
      "Export as KML/GeoJSON/CSV/Excel"
    ]
  }
];

// Storage comparison data
export const storageComparison: StorageComparisonRow[] = [
  { feature: "Duration", permanent: "Saved Forever", temporary: "Current session only" },
  { feature: "Access", permanent: "All your devices", temporary: "This browser only" },
  { feature: "Share with team", permanent: "✅ Yes", temporary: "❌ No" },
  { feature: "Export", permanent: "✅ KML/CSV/Excel", temporary: "❌ Not available" },
  { feature: "Edit later", permanent: "✅ Anytime", temporary: "❌ View only" },
  { feature: "Best for", permanent: "Long-term projects", temporary: "Quick testing" }
];

// Visual elements data
export const visualElements: VisualElement[] = [
  { icon: "📍", title: "Markers", description: "At each vertex (draggable while drawing)" },
  { icon: "🔴", title: "Polygon Fill", description: "Semi-transparent area (default: Red, 35% opacity)" },
  { icon: "⬜", title: "Polygon Border", description: "Outline stroke (2px weight)" },
  { icon: "🔄", title: "Auto-Close", description: "Automatically connects last vertex to first" }
];

// Information display data
export const infoDisplay: VisualElement[] = [
  { icon: "📊", title: "Area", description: "m² / hectares / km² (auto-formatted)" },
  { icon: "📏", title: "Perimeter", description: "Total distance around polygon" },
  { icon: "🎯", title: "Vertices Count", description: "Number of polygon corners" },
  { icon: "🔄", title: "Status", description: "\"Drawing...\" or \"Completed\"" }
];

// Quick access items data
export const quickAccessItems: QuickAccessItem[] = [
  { number: "1️⃣", title: "GIS Data Hub", description: "Data Hub → My Data → Polygon Drawings section", colorClass: "from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-200" },
  { number: "2️⃣", title: "Map Layers Panel", description: "Map page → Layers button → Toggle \"Polygons\" ON", colorClass: "from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 text-green-800 dark:text-green-200" },
  { number: "3️⃣", title: "Load from Tool", description: "Open Polygon Tool → Load Saved dropdown → Select polygon", colorClass: "from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 text-purple-800 dark:text-purple-200" },
  { number: "4️⃣", title: "Global Search", description: "Search box → Type polygon name → Click result", colorClass: "from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 text-orange-800 dark:text-orange-200" },
  { number: "5️⃣", title: "View on Map", description: "Any polygon list → Click \"View on Map\" → Zooms to location", colorClass: "from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800 text-pink-800 dark:text-pink-200" },
  { number: "6️⃣", title: "Export Your Data", description: "Data Hub → Export → Choose format: KML/GeoJSON/CSV/Excel", colorClass: "from-teal-50 to-teal-100 dark:from-teal-900 dark:to-teal-800 text-teal-800 dark:text-teal-200" }
];

// Pro tips data
export const proTips: ProTip[] = [
  { icon: "🎯", title: "Quick Editing", description: "Double-click any saved polygon on map to edit it instantly" },
  { icon: "⌨️", title: "Keyboard Shortcuts", description: "Press Enter to complete drawing, Esc to cancel current action" },
  { icon: "📐", title: "Complex Shapes", description: "Create detailed polygons with 20+ vertices for precise areas" },
  { icon: "💾", title: "Best Practice", description: "Use Permanent storage for work projects, Temporary for quick tests" }
];

