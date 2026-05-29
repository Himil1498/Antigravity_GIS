import type {
  InfrastructureType,
  CustomerType,
} from "../../types/gisToolTypes/index";
import { INFRASTRUCTURE_ICONS, CUSTOMER_ICONS } from "./config";
import {
  getCustomerIcon,
  getInfrastructureIcon,
  getTypeDescription,
} from "./helpers";

/**
 * Get display configuration for info windows and legends
 */
export const getDisplayConfig = (
  type: InfrastructureType,
  isDark: boolean = false,
  customerName?: CustomerType,
) => {
  // Use customer-specific icon for Customer type
  const config =
    type === "Customer" && customerName
      ? getCustomerIcon(customerName)
      : getInfrastructureIcon(type);

  const colorMap: Record<Exclude<InfrastructureType, "Customer">, string> = {
    POP: isDark ? "text-blue-400" : "text-blue-600",
    "Sub POP": isDark ? "text-sky-400" : "text-sky-600",
    "BTS-CO-LO": isDark ? "text-red-400" : "text-red-600",
    "Bandwidth BTS": isDark ? "text-purple-400" : "text-purple-600",
    "Office Location": isDark ? "text-green-400" : "text-green-600",
    NNI: isDark ? "text-orange-400" : "text-orange-600",
    "Data Center": isDark ? "text-indigo-400" : "text-indigo-600",
  };

  // For Customer type, use cyan color since it's dynamic
  const textColor =
    type === "Customer"
      ? isDark
        ? "text-cyan-400"
        : "text-cyan-600"
      : colorMap[type as Exclude<InfrastructureType, "Customer">] ||
        colorMap["POP"];

  return {
    icon: config.emoji,
    color: textColor,
    hexColor: config.color,
  };
};

/**
 * Get legend data for UI components
 */
export const getLegendData = (isDark: boolean = false) => {
  return Object.entries(INFRASTRUCTURE_ICONS).map(([type, config]) => ({
    type: type as InfrastructureType,
    display: getDisplayConfig(type as InfrastructureType, isDark),
    description: getTypeDescription(type as InfrastructureType),
  }));
};

/**
 * Get customer legend data for UI components
 */
export const getCustomerLegendData = (isDark: boolean = false) => {
  return Object.entries(CUSTOMER_ICONS).map(([customerName, config]) => ({
    name: customerName as CustomerType,
    icon: config.emoji,
    color: config.color,
    colorClass: isDark ? "text-gray-300" : "text-gray-700",
  }));
};

