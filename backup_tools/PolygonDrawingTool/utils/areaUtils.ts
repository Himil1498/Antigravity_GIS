/**
 * Utilities for area unit conversions and formatting
 */

export type AreaUnit = 'sqm' | 'sqkm' | 'sqft' | 'sqmi' | 'acre' | 'hectare';

export const AREA_UNITS: { value: AreaUnit; label: string }[] = [
  { value: 'sqm', label: 'Square Meters (m²)' },
  { value: 'sqkm', label: 'Square Kilometers (km²)' },
  { value: 'sqft', label: 'Square Feet (ft²)' },
  { value: 'sqmi', label: 'Square Miles (mi²)' },
  { value: 'acre', label: 'Acres' },
  { value: 'hectare', label: 'Hectares' },
];

/**
 * Format area value based on selected unit
 */
export const formatArea = (sqMeters: number, unit: AreaUnit): string => {
  if (sqMeters <= 0) return '0.00';

  let value = sqMeters;
  let unitLabel = '';

  switch (unit) {
    case 'sqm':
      unitLabel = 'sq m';
      break;
    case 'sqkm':
      value = sqMeters / 1_000_000;
      unitLabel = 'sq km';
      break;
    case 'sqft':
      value = sqMeters / 0.092903;
      unitLabel = 'sq ft';
      break;
    case 'sqmi':
      value = sqMeters / 2_589_988.11;
      unitLabel = 'sq mi';
      break;
    case 'acre':
      value = sqMeters / 4046.86;
      unitLabel = 'acres';
      break;
    case 'hectare':
      value = sqMeters / 10_000;
      unitLabel = 'ha';
      break;
    default:
      unitLabel = 'sq m';
  }

  // Format with commas and appropriate decimal places
  const formattedValue = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formattedValue} ${unitLabel}`;
};
