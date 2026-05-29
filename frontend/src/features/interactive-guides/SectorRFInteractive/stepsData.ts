import { Step } from './types';

// Steps 1-5: Open Tool to Adjust Beamwidth
export const stepsFirstHalf: Step[] = [
  {
    id: 1,
    title: "Open Tool",
    icon: "🎯",
    color: "red",
    action: "Click 'RF Sector Tool' button in Map toolbar",
    result: "Tool panel appears, cursor changes to crosshair (+)",
    details: [
      "Navigate to Map Page",
      "Click on 'RF Sector Tool' button in toolbar",
      "Or select from GIS Tools dropdown menu",
      "Tool panel overlay appears on map",
      "Map cursor changes to crosshair (+)",
      "Status: 'Click on map to place tower location'",
      "Default values: Azimuth 0°, Beamwidth 60°, Radius 1000m"
    ]
  },
  {
    id: 2,
    title: "Place Tower Location",
    icon: "🗼",
    color: "blue",
    action: "Click anywhere on map to place tower/antenna",
    result: "RF sector appears instantly as pie slice shape",
    details: [
      "Click anywhere on the map",
      "Tower marker appears (📡 red antenna icon)",
      "Coordinates captured: { lat, lng }",
      "📡 Sector drawn as pie slice shape",
      "🧭 Default direction: 0° (North)",
      "📐 Default beamwidth: 60° (angular width)",
      "📏 Default radius: 1000m (1 km coverage)",
      "🟠 Orange fill color (default #FF5722)",
      "Status: 'Tower placed. Configure sector parameters.'"
    ]
  },
  {
    id: 3,
    title: "View Sector Elements",
    icon: "👁️",
    color: "green",
    action: "Observe all visual elements on map",
    result: "Complete RF sector with all components visible",
    details: [
      "🗼 Tower Marker: Red antenna icon (📡) at center",
      "📐 Sector Polygon: Pie slice shape (60° width)",
      "🟠 Orange Fill: Semi-transparent (40% opacity)",
      "🔴 Border: 2px stroke outline",
      "➡️ Direction Line: Arrow showing azimuth",
      "📊 Coverage Area: 0.52 km² (calculated)",
      "📏 Arc Length: 1.05 km (outer edge)",
      "📍 Tower coordinates displayed in panel"
    ]
  },
  {
    id: 4,
    title: "Adjust Azimuth",
    icon: "🧭",
    color: "indigo",
    action: "Rotate sector to desired direction (0-360°)",
    result: "Sector rotates with compass direction shown",
    details: [
      "🧭 Azimuth = Direction antenna is pointing",
      "⬆️ 0° = North (points upward)",
      "➡️ 90° = East (points right)",
      "⬇️ 180° = South (points downward)",
      "⬅️ 270° = West (points left)",
      "Use Azimuth Slider: 0-360°",
      "Or type value in input field",
      "✅ Sector rotates in real-time",
      "✅ Direction line updates instantly"
    ]
  },
  {
    id: 5,
    title: "Adjust Beamwidth",
    icon: "📐",
    color: "purple",
    action: "Change angular width of sector (10-180°)",
    result: "Sector widens or narrows with area recalculated",
    details: [
      "📐 Beamwidth = Angular width of RF sector",
      "📡 How 'wide' the antenna coverage is",
      "🎯 Default: 60° (common for cell towers)",
      "Range: 10° (narrow) to 180° (wide)",
      "Common: 60° (3-sector), 120° (3-sector 360°)",
      "Use Beamwidth Slider: 10-180°",
      "Or type value in input field",
      "✅ Sector widens/narrows instantly",
      "✅ Coverage area auto-recalculates"
    ]
  }
];

