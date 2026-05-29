import type {
  InfrastructureType,
  CustomerType,
} from "../../types/gisToolTypes/index";
import type { IconConfig } from "./types";
import { INFRASTRUCTURE_ICONS, CUSTOMER_ICONS } from "./config";

/**
 * Get customer-specific icon configuration
 */
export const getCustomerIcon = (customerName?: CustomerType): IconConfig => {
  if (customerName && CUSTOMER_ICONS[customerName]) {
    return CUSTOMER_ICONS[customerName];
  }
  // Fallback to first customer icon (Jio)
  return CUSTOMER_ICONS["Reliance Jio Infocomm Limited"];
};

/**
 * Get icon configuration for a given infrastructure type
 */
export const getInfrastructureIcon = (type: InfrastructureType): IconConfig => {
  // Customer type should never use this - always use getCustomerIcon instead
  if (type === "Customer") {
    return getCustomerIcon();
  }
  return (
    INFRASTRUCTURE_ICONS[type as Exclude<InfrastructureType, "Customer">] ||
    INFRASTRUCTURE_ICONS["POP"]
  );
};

/**
 * Get type description
 */
export const getTypeDescription = (type: InfrastructureType): string => {
  const descriptions: Record<InfrastructureType, string> = {
    POP: "Point of Presence",
    "Sub POP": "Sub Point of Presence",
    "BTS-CO-LO": "BTS Co-Location",
    "Bandwidth BTS": "Bandwidth BTS",
    "Office Location": "Office Location",
    NNI: "Network to Network Interface",
    "Data Center": "Data Center",
    Customer: "Customer Location",
  };
  return descriptions[type] || "Infrastructure";
};

/**
 * Get all infrastructure types for dropdowns
 */
export const getAllInfrastructureTypes = (): InfrastructureType[] => {
  // Return all infrastructure types including 'Customer'
  return [
    ...Object.keys(INFRASTRUCTURE_ICONS),
    "Customer",
  ] as InfrastructureType[];
};

