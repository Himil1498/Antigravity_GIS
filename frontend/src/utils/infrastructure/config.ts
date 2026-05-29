import type {
  InfrastructureType,
  CustomerType,
} from "../../types/gisToolTypes/index";
import type { IconConfig } from "./types";

// Centralized icon configuration for 7 infrastructure types (Customer type uses specific customer icons below)
export const INFRASTRUCTURE_ICONS: Record<
  Exclude<InfrastructureType, "Customer">,
  IconConfig
> = {
  POP: {
    emoji: "🗼",
    color: "#1976D2", // Blue
    shape: "pin",
    svgPath:
      "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  },
  "Sub POP": {
    emoji: "🏗️",
    color: "#42A5F5", // Light Blue
    shape: "circle",
    svgPath: "CIRCLE", // Google Maps SymbolPath.CIRCLE
  },
  "BTS-CO-LO": {
    emoji: "📡",
    color: "#D32F2F", // Red
    shape: "star",
    svgPath: "M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z", // Star shape
  },
  "Bandwidth BTS": {
    emoji: "📶",
    color: "#7B1FA2", // Purple
    shape: "diamond",
    svgPath: "M12 2l8 10-8 10-8-10z", // Diamond shape
  },
  "Office Location": {
    emoji: "🏬",
    color: "#388E3C", // Green
    shape: "square",
    svgPath: "M4 4h16v16H4z", // Square shape
  },
  NNI: {
    emoji: "🔗",
    color: "#F57C00", // Orange
    shape: "triangle",
    svgPath: "M12 2l10 18H2z", // Triangle shape
  },
  "Data Center": {
    emoji: "🏛️",
    color: "#1565C0", // Dark Blue
    shape: "square",
    svgPath: "M3 3h18v5H3zm0 8h18v5H3zm0 8h18v5H3z", // Server rack shape
  },
};

// Customer-specific icon mappings for consistent customer representation
export const CUSTOMER_ICONS: Record<CustomerType, IconConfig> = {
  "Reliance Jio Infocomm Limited": {
    emoji: "📱",
    color: "#0066CC", // Jio Blue
    shape: "circle",
    svgPath: "CIRCLE",
  },
  "Vodafone Idea Limited": {
    emoji: "📳",
    color: "#E60012", // Vodafone Red
    shape: "circle",
    svgPath: "CIRCLE",
  },
  "SIFY Technologies Limited": {
    emoji: "💻",
    color: "#00A651", // SIFY Green
    shape: "circle",
    svgPath: "CIRCLE",
  },
  "Tata Communications Limited": {
    emoji: "🌐",
    color: "#1F4E79", // Tata Blue
    shape: "circle",
    svgPath: "CIRCLE",
  },
  "Bharti Airtel Limited": {
    emoji: "📞",
    color: "#DC143C", // Airtel Red
    shape: "circle",
    svgPath: "CIRCLE",
  },
};

// Status-based color modifications
export const STATUS_COLORS = {
  Active: (baseColor: string) => baseColor,
  Inactive: () => "#757575", // Gray
  Maintenance: () => "#FF9800", // Orange
  RFS: () => "#4CAF50", // Green
  Planned: () => "#9E9E9E", // Light Gray
  Damaged: () => "#F44336", // Red
};

