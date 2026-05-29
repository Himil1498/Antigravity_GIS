
/**
 * Calculate First Fresnel zone radius at a point
 * Formula: r = √((λ × d1 × d2) / (d1 + d2))
 *
 * @param d1 Distance from start point (meters)
 * @param d2 Distance to end point (meters)
 * @param frequency RF frequency (MHz)
 * @returns Radius in meters
 */
export const calculateFresnelRadius = (
  d1: number,
  d2: number,
  frequency: number
): number => {
  if (d1 <= 0 || d2 <= 0) return 0;

  // Convert frequency to wavelength (meters)
  const c = 299792458; // Speed of light (m/s)
  const wavelength = c / (frequency * 1e6);

  // First Fresnel zone radius
  const radius = Math.sqrt((wavelength * d1 * d2) / (d1 + d2));

  return radius;
};

/**
 * Calculate recommended clearance percentage based on frequency
 * Lower frequencies require more clearance
 */
export const getRecommendedClearance = (frequency: number): number => {
  if (frequency < 1000) return 0.8; // 80% for UHF
  if (frequency < 3000) return 0.6; // 60% for S-band (2.4 GHz WiFi)
  if (frequency < 6000) return 0.5; // 50% for C-band (5 GHz WiFi)
  return 0.4; // 40% for higher frequencies
};

