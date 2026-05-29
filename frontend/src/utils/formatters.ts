/**
 * Common formatting utilities
 */

// Format date helper
export const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDistance = (meters: number) => {
  if (!meters && meters !== 0) return "0 m";
  if (meters < 1000) return `${meters.toFixed(2)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};

export const formatArea = (sqMeters: number) => {
  if (!sqMeters && sqMeters !== 0) return "0 m²";
  if (sqMeters < 1000000) return `${sqMeters.toFixed(2)} m²`;
  return `${(sqMeters / 1000000).toFixed(2)} km²`;
};

