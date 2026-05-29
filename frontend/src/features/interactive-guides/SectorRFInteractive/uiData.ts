import { 
  VisualElement, RFParameter, StorageComparisonRow, AccessMethod, 
  AzimuthDirection, BeamwidthConfig, CoverageRange, KeyFeature, UseCase 
} from './types';

// Visual elements data
export const visualElements: VisualElement[] = [
  { icon: "🗼", title: "Tower Marker", description: "Red antenna icon (📡) at center point" },
  { icon: "📐", title: "Sector Polygon", description: "Pie slice shape representing coverage area" },
  { icon: "🟠", title: "Sector Fill", description: "Semi-transparent colored area (default orange 40%)" },
  { icon: "🔴", title: "Sector Border", description: "2px stroke outline (same color as fill)" },
  { icon: "➡️", title: "Direction Line", description: "Arrow showing azimuth/pointing direction" },
  { icon: "🧭", title: "Azimuth Indicator", description: "Compass direction (N, NE, E, SE, S, SW, W, NW)" },
  { icon: "📊", title: "Coverage Area", description: "Calculated sector area in km²" },
  { icon: "📏", title: "Arc Length", description: "Outer edge distance of sector" }
];

// RF parameters data
export const rfParameters: RFParameter[] = [
  { param: "Azimuth", range: "0-360°", desc: "Direction antenna points (0°=North)" },
  { param: "Beamwidth", range: "10-180°", desc: "Angular width of sector coverage" },
  { param: "Radius", range: "100m-50km", desc: "Maximum coverage distance" },
  { param: "Frequency", range: "Custom", desc: "e.g., 1800 MHz, 2100 MHz, 2600 MHz" },
  { param: "Technology", range: "2G/3G/4G/5G", desc: "Network generation type" },
  { param: "Antenna Height", range: "Custom", desc: "Height above ground (meters)" },
  { param: "Power", range: "Optional", desc: "Transmission power in watts" }
];

// Storage comparison data
export const storageComparison: StorageComparisonRow[] = [
  { feature: "Duration", permanent: "Saved Forever", temporary: "Current session only" },
  { feature: "Access", permanent: "All your devices", temporary: "This browser only" },
  { feature: "Share with team", permanent: "✅ Yes", temporary: "❌ No" },
  { feature: "Edit Later", permanent: "✅ Anytime", temporary: "❌ View only" },
  { feature: "RF Details", permanent: "✅ All fields saved", temporary: "❌ Basic only" },
  { feature: "Export", permanent: "✅ KML/GeoJSON/CSV/Excel", temporary: "❌ Not available" },
  { feature: "Search", permanent: "✅ Searchable", temporary: "❌ No search" },
  { feature: "Best For", permanent: "Network planning", temporary: "Quick testing" }
];

// Access methods data
export const accessMethods: AccessMethod[] = [
  { number: "1️⃣", title: "GIS Data Hub", description: "Data Hub → My Data → RF Sectors section", color: "blue" },
  { number: "2️⃣", title: "Map Layers Panel", description: "Map page → Layers button → Toggle 'RF Sectors' ON", color: "green" },
  { number: "3️⃣", title: "Load from Tool", description: "Open RF Sector Tool → Load Saved dropdown → Select sector", color: "purple" },
  { number: "4️⃣", title: "Global Search", description: "Search box → Type sector/tower name → Click result", color: "orange" },
  { number: "5️⃣", title: "Export Data", description: "Data Hub → Export → Choose format: KML/GeoJSON/CSV/Excel", color: "teal" }
];

// Azimuth directions - primary
export const primaryDirections: AzimuthDirection[] = [
  { icon: "⬆️", degrees: "0° / 360°", direction: "North" },
  { icon: "➡️", degrees: "90°", direction: "East" },
  { icon: "⬇️", degrees: "180°", direction: "South" },
  { icon: "⬅️", degrees: "270°", direction: "West" }
];

// Azimuth directions - secondary
export const secondaryDirections: AzimuthDirection[] = [
  { icon: "↗️", degrees: "45°", direction: "Northeast" },
  { icon: "↘️", degrees: "135°", direction: "Southeast" },
  { icon: "↙️", degrees: "225°", direction: "Southwest" },
  { icon: "↖️", degrees: "315°", direction: "Northwest" }
];

// Beamwidth configurations data
export const beamwidthConfigs: BeamwidthConfig[] = [
  {
    title: "3-Sector Site (120°)",
    subtitle: "Most common cell tower configuration",
    colorClass: "from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800",
    textColorClass: "text-blue-800 dark:text-blue-200",
    items: [
      "Sector 1: 0° azimuth, 120° beamwidth",
      "Sector 2: 120° azimuth, 120° beamwidth",
      "Sector 3: 240° azimuth, 120° beamwidth",
      "Total: 360° coverage (no gaps)"
    ]
  },
  {
    title: "6-Sector Site (60°)",
    subtitle: "High-capacity urban sites",
    colorClass: "from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800",
    textColorClass: "text-purple-800 dark:text-purple-200",
    items: [
      "Sectors at: 0°, 60°, 120°, 180°, 240°, 300°",
      "Each: 60° beamwidth",
      "Doubles capacity vs 3-sector",
      "Common in dense urban areas"
    ]
  },
  {
    title: "Narrow Beam (30°)",
    subtitle: "Long-range, focused coverage",
    colorClass: "from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800",
    textColorClass: "text-orange-800 dark:text-orange-200",
    items: [
      "Point-to-point links",
      "Highway/railway coverage",
      "Rural long-range service",
      "Higher gain, longer reach"
    ]
  },
  {
    title: "Wide Beam (180°)",
    subtitle: "Coastal/border coverage",
    colorClass: "from-green-50 to-green-100 dark:from-green-900 dark:to-green-800",
    textColorClass: "text-green-800 dark:text-green-200",
    items: [
      "Coastal area coverage (landward)",
      "Border installations",
      "Indoor DAS systems",
      "Maximum area coverage"
    ]
  }
];

// Coverage ranges by technology
export const coverageRanges: CoverageRange[] = [
  { icon: "5️⃣", title: "5G Networks", items: ["Urban: 200-500m", "Suburban: 500-1000m", "High frequency (mmWave)", "Dense site deployment needed"] },
  { icon: "4️⃣", title: "4G/LTE Networks", items: ["Urban: 500-1500m", "Suburban: 1000-3000m", "Rural: 3000-10000m", "Most common deployment"] },
  { icon: "3️⃣", title: "3G Networks", items: ["Urban: 1000-2000m", "Suburban: 3000-8000m", "Rural: 5000-15000m", "Legacy coverage layer"] },
  { icon: "2️⃣", title: "2G Networks", items: ["Urban: 2000-5000m", "Suburban: 5000-15000m", "Rural: 10000-35000m", "Maximum range, voice priority"] }
];

// Key features data
export const keyFeatures: KeyFeature[] = [
  { title: "🧭 Precise Direction Control", items: ["Azimuth: 0-360° rotation", "Compass direction display", "Real-time sector rotation", "Direction arrow indicator"] },
  { title: "📐 Flexible Coverage", items: ["Beamwidth: 10-180° adjustable", "Radius: 100m - 50km range", "Auto-calculated area/arc", "Common presets available"] },
  { title: "📡 RF Technical Data", items: ["Frequency specification", "Technology type (2G-5G)", "Antenna height tracking", "Power & status fields"] },
  { title: "💾 Flexible Storage", items: ["Save forever or temporarily", "Access from any device", "Multi-format export", "Share with team members"] }
];

// Use cases data
export const useCases: UseCase[] = [
  { title: "📱 Cellular Network Planning", description: "Site design, coverage optimization, capacity planning, interference analysis" },
  { title: "📡 RF Engineering", description: "Signal propagation, frequency planning, antenna alignment, site surveys" },
  { title: "🗺️ Coverage Mapping", description: "Network visualization, gap analysis, overlay mapping, competitor comparison" },
  { title: "📊 Network Optimization", description: "Capacity upgrades, technology migration, 5G rollout, site decommissioning" }
];

