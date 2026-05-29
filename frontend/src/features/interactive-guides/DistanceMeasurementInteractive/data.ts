import { Step, StorageComparisonRow } from './types';

export const steps: Step[] = [
  {
    id: 1,
    title: "Open Tool",
    icon: "🎯",
    color: "blue",
    action: "Click 'Distance Measurement' button on Map",
    result: "Tool panel opens, cursor becomes crosshair (+)",
    details: [
      "Navigate to Map page (/map)",
      "Find Distance Tool in sidebar",
      "Click to activate",
      "Map ready for measurement",
    ],
  },
  {
    id: 2,
    title: "Add Points",
    icon: "📍",
    color: "purple",
    action: "Click on map to place measurement points",
    result: "Markers appear, lines drawn, distance calculated",
    details: [
      "Point 1: Click anywhere → Red marker appears",
      "Point 2: Click again → Line connects points",
      "Point 3+: Continue clicking to extend path",
      "Real-time distance updates shown",
    ],
  },
  {
    id: 3,
    title: "Optional: 360° View",
    icon: "🌍",
    color: "green",
    action: "Toggle '360° View' button",
    result: "Street View opens at clicked location",
    details: [
      "Click Enable 360° View button",
      "Street View panorama opens (if available)",
      "Rotate 360° to see surroundings",
      "Verify path visually",
    ],
  },
  {
    id: 4,
    title: "Edit (Optional)",
    icon: "✏️",
    color: "orange",
    action: "Use Undo or Clear buttons",
    result: "Points removed, distance recalculated",
    details: [
      "Undo: Remove last point",
      "Clear: Remove all points (with confirmation)",
      "Both buttons update distance automatically",
      "Start fresh or make corrections",
    ],
  },
  {
    id: 5,
    title: "Save Measurement",
    icon: "💾",
    color: "teal",
    action: "Click Save button",
    result: "Save dialog opens",
    details: [
      "Enter Measurement Name (required)",
      "Add Notes (optional)",
      "Choose Unit (meters/kilometers)",
      "Select storage type",
    ],
  },
  {
    id: 6,
    title: "Choose Storage",
    icon: "🗄️",
    color: "indigo",
    action: "Select Permanent or Temporary",
    result: "Data saved to chosen in-app storage option",
    details: [
      "Permanent 🔒: Save to My Data (persistent in-app)",
      "Temporary ⏰: Session storage (cleared on close)",
      "Click Save to confirm",
      "Success message appears",
    ],
  },
  {
    id: 7,
    title: "Access Data",
    icon: "📂",
    color: "pink",
    action: "Retrieve saved measurements",
    result: "View, edit, or export your data",
    details: [
      "GIS Data Hub → My Data tab",
      "Map Layers → Toggle Distance layer",
      "Tool → Load Saved button",
      "Export as KML/CSV/Excel/PDF",
    ],
  },
];

export const storageComparison: StorageComparisonRow[] = [
  {
    feature: "Saved to",
    permanent: "My Data (in-app)",
    temporary: "Session (temporary)",
  },
  {
    feature: "Duration",
    permanent: "Persistent (until removed)",
    temporary: "Until browser close",
  },
  {
    feature: "Access",
    permanent: "Available in My Data",
    temporary: "Current session only",
  },
  {
    feature: "Editable",
    permanent: "✅ Yes",
    temporary: "✅ Yes (during session)",
  },
  {
    feature: "Exportable",
    permanent: "✅ Yes (KML/CSV/Excel/PDF)",
    temporary: "✅ Yes (session export)",
  },
];

