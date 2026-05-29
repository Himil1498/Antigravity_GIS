import { VisualElement, StorageComparisonRow, AccessMethod } from './types';

export const visualElements: VisualElement[] = [
  {
    icon: "📍",
    title: "Center Marker",
    description: "Pin at exact circle center point",
  },
  {
    icon: "⭕",
    title: "Circle Fill",
    description: "Semi-transparent colored area (default red 35%)",
  },
  {
    icon: "🔴",
    title: "Circle Border",
    description: "2px stroke outline (same color as fill)",
  },
  {
    icon: "🔵",
    title: "Resize Handles",
    description: "4 blue squares at cardinal points (N, S, E, W)",
  },
  {
    icon: "↔️",
    title: "Draggable Area",
    description: "Click inside circle to move entire shape",
  },
  {
    icon: "📊",
    title: "Info Panel",
    description: "Shows radius, area, perimeter, coordinates",
  },
  {
    icon: "🎨",
    title: "Color Picker",
    description: "RGB/Hex color selector for fill & stroke",
  },
  {
    icon: "💧",
    title: "Opacity Slider",
    description: "0-100% transparency control",
  },
];

export const storageComparison: StorageComparisonRow[] = [
  {
    feature: "Saved to",
    permanent: "My Data (app)",
    temporary: "Session (temporary)",
  },
  {
    feature: "Duration",
    permanent: "Persistent (until removed)",
    temporary: "Active session only",
  },
  {
    feature: "Access",
    permanent: "Available in My Data",
    temporary: "Current browser session",
  },
  {
    feature: "Editable",
    permanent: "✅ Yes",
    temporary: "✅ Yes (during session)",
  },
  {
    feature: "Exportable",
    permanent: "✅ Yes (KML/GeoJSON/CSV)",
    temporary: "✅ Yes (session export)",
  },
  {
    feature: "Searchable",
    permanent: "✅ Yes",
    temporary: "✅ Limited to session results",
  },
  {
    feature: "Location",
    permanent: "My Data section",
    temporary: "In-memory / session cache",
  },
];

export const accessMethods: AccessMethod[] = [
  {
    number: "1️⃣",
    title: "GIS Data Hub",
    description: "Data Hub → My Data → Circle Drawings section",
    color: "blue",
  },
  {
    number: "2️⃣",
    title: "Map Layers",
    description: "Map page → Layers button → Toggle 'Circles' ON",
    color: "green",
  },
  {
    number: "3️⃣",
    title: "Load in Tool",
    description: "Open Circle Tool → Load Saved dropdown → Select",
    color: "purple",
  },
  {
    number: "4️⃣",
    title: "Global Search",
    description: "Search box → Type circle name → Click result",
    color: "orange",
  },
  {
    number: "5️⃣",
    title: "Export Data",
    description: "Data Hub → Export → KML/GeoJSON/CSV/Excel",
    color: "teal",
  },
  {
    number: "6️⃣",
    title: "Session Storage",
    description: "DevTools → Application → session cache (temporary)",
    color: "yellow",
  },
];

