export const calculateHaversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


export type DistanceUnit = 'm' | 'km' | 'ft' | 'mi' | 'nm';

export const DISTANCE_UNITS: { value: DistanceUnit; label: string }[] = [
  { value: 'm', label: 'Meters (m)' },
  { value: 'km', label: 'Kilometers (km)' },
  { value: 'ft', label: 'Feet (ft)' },
  { value: 'mi', label: 'Miles (mi)' },
  { value: 'nm', label: 'Nautical Miles (nm)' },
];

/**
 * Enhanced distance formatter supporting multiple units
 */
export const formatDistanceWithUnit = (meters: number, unit: DistanceUnit = 'km'): string => {
  if (meters <= 0) return meters < 0 ? "0.00" : "0.00 " + unit;
  
  let value = meters;
  let label = unit;

  switch (unit) {
    case 'km':
      value = meters / 1000;
      break;
    case 'ft':
      value = meters * 3.28084;
      break;
    case 'mi':
      value = meters * 0.000621371;
      break;
    case 'nm':
      value = meters * 0.000539957;
      break;
    case 'm':
    default:
      label = 'm';
  }

  return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${label}`;
};

export const formatDistance = (meters: number): string => {
  return meters < 1000
    ? `${meters.toFixed(2)} m`
    : `${(meters / 1000).toFixed(2)} km`;
};

export const formatElevation = (meters: number): string => {
  return `${meters.toFixed(1)} m`;
};


