/**
 * Color Palette for Region Boundaries
 * 37 visually distinct colors for Indian States/UTs
 *
 * Colors are carefully selected to:
 * - Be visually distinct from each other
 * - Work well with 15% opacity fill
 * - Stand out against map backgrounds (Roadmap, Satellite, Hybrid, Terrain)
 * - Have good contrast for borders
 */

export interface BoundaryColor {
  fill: string;        // Fill color (15% opacity applied in rendering)
  stroke: string;      // Border color (full opacity)
  hoverFill: string;   // Fill color on hover (25% opacity applied)
  hoverStroke: string; // Border color on hover (thicker, brighter)
}

/**
 * 37-color palette organized by hue families
 * Ensures adjacent states have different colors
 */
const COLOR_PALETTE: string[] = [
  // Reds & Pinks (5)
  '#E53935', // Bright Red
  '#D81B60', // Deep Pink
  '#F06292', // Light Pink
  '#EF5350', // Red
  '#EC407A', // Pink

  // Purples & Violets (5)
  '#8E24AA', // Purple
  '#AB47BC', // Light Purple
  '#7B1FA2', // Deep Purple
  '#9C27B0', // Purple
  '#BA68C8', // Lavender

  // Blues (7)
  '#1E88E5', // Blue
  '#039BE5', // Light Blue
  '#0277BD', // Dark Blue
  '#1976D2', // Blue
  '#29B6F6', // Sky Blue
  '#4FC3F7', // Light Sky Blue
  '#0288D1', // Blue

  // Teals & Cyans (5)
  '#00ACC1', // Cyan
  '#26C6DA', // Light Cyan
  '#00897B', // Teal
  '#00BCD4', // Cyan
  '#80DEEA', // Light Teal

  // Greens (5)
  '#43A047', // Green
  '#66BB6A', // Light Green
  '#2E7D32', // Dark Green
  '#4CAF50', // Green
  '#81C784', // Pale Green

  // Yellows & Ambers (5)
  '#FFB300', // Amber
  '#FDD835', // Yellow
  '#F9A825', // Gold
  '#FBC02D', // Yellow
  '#FFD54F', // Light Yellow

  // Oranges & Browns (5)
  '#FB8C00', // Orange
  '#FF6F00', // Dark Orange
  '#F4511E', // Deep Orange
  '#6D4C41', // Brown
  '#8D6E63', // Light Brown
];

/**
 * Monochrome color (for "same color for all" mode)
 */
const MONOCHROME_COLOR = '#2196F3'; // Material Blue

/**
 * Get color for a specific region by index
 * @param index - Region index (0-36)
 * @param monochrome - Use monochrome mode (all states same color)
 */
export const getRegionColor = (index: number, monochrome: boolean = false): BoundaryColor => {
  // Use monochrome if enabled
  const baseColor = monochrome ? MONOCHROME_COLOR : COLOR_PALETTE[index % COLOR_PALETTE.length];

  return {
    fill: baseColor,
    stroke: baseColor,
    hoverFill: baseColor,
    hoverStroke: brightenColor(baseColor, 20), // 20% brighter on hover
  };
};

/**
 * Get color by region code (e.g., "MH" for Maharashtra)
 * @param regionCode - State/UT code
 * @param monochrome - Use monochrome mode
 */
export const getColorByRegionCode = (regionCode: string, monochrome: boolean = false): BoundaryColor => {
  const index = REGION_CODE_TO_INDEX[regionCode] ?? 0;
  return getRegionColor(index, monochrome);
};

/**
 * Get color by region ID (database region_id)
 * @param regionId - Database region ID
 * @param regionCode - State/UT code (for color lookup)
 * @param monochrome - Use monochrome mode
 */
export const getColorByRegionId = (
  regionId: number,
  regionCode: string,
  monochrome: boolean = false
): BoundaryColor => {
  return getColorByRegionCode(regionCode, monochrome);
};

/**
 * Brighten a hex color by a percentage
 * @param hex - Hex color (e.g., "#2196F3")
 * @param percent - Percentage to brighten (0-100)
 */
function brightenColor(hex: string, percent: number): string {
  // Remove '#' if present
  hex = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Brighten
  const newR = Math.min(255, r + (255 - r) * (percent / 100));
  const newG = Math.min(255, g + (255 - g) * (percent / 100));
  const newB = Math.min(255, b + (255 - b) * (percent / 100));

  // Convert back to hex
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Mapping of Indian State/UT codes to color palette indices
 * Organized geographically to ensure adjacent states have different colors
 */
const REGION_CODE_TO_INDEX: Record<string, number> = {
  // North India (0-7)
  'JK': 0,   // Jammu and Kashmir - Red
  'HP': 5,   // Himachal Pradesh - Purple
  'PB': 10,  // Punjab - Blue
  'CH': 15,  // Chandigarh - Teal
  'UK': 20,  // Uttarakhand - Green
  'HR': 25,  // Haryana - Yellow
  'DL': 30,  // Delhi - Orange
  'UP': 1,   // Uttar Pradesh - Pink

  // East India (8-12)
  'BR': 11,  // Bihar - Blue
  'WB': 16,  // West Bengal - Cyan
  'JH': 21,  // Jharkhand - Green
  'OR': 26,  // Odisha - Amber
  'SK': 6,   // Sikkim - Violet

  // Northeast India (13-19)
  'AS': 12,  // Assam - Dark Blue
  'NL': 17,  // Nagaland - Teal
  'MN': 22,  // Manipur - Dark Green
  'MZ': 27,  // Mizoram - Gold
  'TR': 32,  // Tripura - Orange
  'ML': 7,   // Meghalaya - Lavender
  'AR': 2,   // Arunachal Pradesh - Deep Pink

  // West India (20-25)
  'RJ': 13,  // Rajasthan - Blue
  'GJ': 18,  // Gujarat - Light Cyan
  'MH': 23,  // Maharashtra - Green
  'GA': 28,  // Goa - Yellow
  'DD': 33,  // Daman and Diu - Deep Orange
  'DNH': 3,  // Dadra and Nagar Haveli - Red

  // South India (26-31)
  'MP': 8,   // Madhya Pradesh - Light Purple
  'CG': 14,  // Chhattisgarh - Cyan
  'AP': 19,  // Andhra Pradesh - Light Teal
  'TG': 24,  // Telangana - Pale Green
  'KA': 29,  // Karnataka - Light Yellow
  'TN': 34,  // Tamil Nadu - Brown

  // Far South & Islands (32-36)
  'KL': 9,   // Kerala - Deep Purple
  'PY': 4,   // Puducherry - Light Pink
  'AN': 35,  // Andaman and Nicobar Islands - Light Brown
  'LD': 36,  // Lakshadweep - Brown
  'LA': 31,  // Ladakh - Dark Orange
};

/**
 * Get all colors (useful for legend/preview)
 */
export const getAllColors = (monochrome: boolean = false): BoundaryColor[] => {
  if (monochrome) {
    return [getRegionColor(0, true)];
  }
  return COLOR_PALETTE.map((_, index) => getRegionColor(index, false));
};

/**
 * Get recommended fill opacity (as decimal)
 */
export const DEFAULT_FILL_OPACITY = 0.15; // 15%

/**
 * Get recommended hover fill opacity (as decimal)
 */
export const HOVER_FILL_OPACITY = 0.25; // 25%

/**
 * Get recommended stroke weight (in pixels)
 */
export const DEFAULT_STROKE_WEIGHT = 2; // 2px

/**
 * Get recommended hover stroke weight (in pixels)
 */
export const HOVER_STROKE_WEIGHT = 3; // 3px (thicker on hover)

