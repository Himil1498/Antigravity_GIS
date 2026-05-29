import { useCallback } from "react";

export const useCircleGeometry = () => {
  /**
   * Helper: validate radius
   */
  const validateRadius = useCallback((value: number): number => {
    const parsed = parseFloat(String(value));
    if (isNaN(parsed) || !isFinite(parsed)) return 1000;
    // Clamp between 100m and 5000km (covers entire country)
    return Math.min(5000000, Math.max(100, parsed));
  }, []);

  /**
   * Calculate area and perimeter safely
   */
  const calculateGeometry = useCallback((
    r: number,
    setArea: (a: number) => void,
    setPerimeter: (p: number) => void
  ) => {
    if (typeof r !== "number" || isNaN(r) || !isFinite(r) || r <= 0) {
      console.warn("Invalid radius for geometry:", r);
      setArea(0);
      setPerimeter(0);
      return;
    }

    const clampedRadius = Math.min(5000000, Math.max(10, r));

    try {
      const calculatedArea = Math.PI * clampedRadius * clampedRadius;
      if (isFinite(calculatedArea)) {
        setArea(calculatedArea);
      } else {
        setArea(0);
      }

      const calculatedPerimeter = 2 * Math.PI * clampedRadius;
      if (isFinite(calculatedPerimeter)) {
        setPerimeter(calculatedPerimeter);
      } else {
        setPerimeter(0);
      }
    } catch (error) {
      console.error("Error calculating geometry:", error);
      setArea(0);
      setPerimeter(0);
    }
  }, []);

  // Formatters
  const formatArea = (sqMeters: number): string => {
    if (!isFinite(sqMeters) || sqMeters < 0) {
      return "0 m²";
    }

    if (sqMeters < 1000) {
      return `${sqMeters.toFixed(2)} m²`;
    } else if (sqMeters < 10000) {
      return `${sqMeters.toFixed(0)} m² (${(sqMeters / 10000).toFixed(3)} ha)`;
    } else if (sqMeters < 1000000) {
      return `${(sqMeters / 10000).toFixed(2)} hectares`;
    } else if (sqMeters < 10000000) {
      return `${(sqMeters / 1000000).toFixed(2)} km² (${(sqMeters / 10000).toFixed(0)} ha)`;
    } else {
      return `${(sqMeters / 1000000).toFixed(2)} km²`;
    }
  };

  const formatDistance = (meters: number): string => {
    if (!isFinite(meters) || meters < 0) {
      return "0 m";
    }

    if (meters < 1000) {
      return `${meters.toFixed(2)} m`;
    } else {
      return `${(meters / 1000).toFixed(2)} km`;
    }
  };

  return {
    validateRadius,
    calculateGeometry,
    formatArea,
    formatDistance
  };
};

