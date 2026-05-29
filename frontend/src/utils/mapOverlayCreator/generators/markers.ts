
import { getMapMarkerIcon } from "../../infrastructure/index";
import type { InfrastructureType, CustomerType } from "../../../types/gisToolTypes/index";

/**
 * Create Infrastructure Marker Overlay
 */
export const createInfrastructureOverlay = (
  data: any,
  map: google.maps.Map,
  overlays: any[]
) => {
  const position = {
    lat: Number(data.latitude),
    lng: Number(data.longitude),
  };

  const itemType = (data.item_type || data.type || "POP") as InfrastructureType;
  const customerName = data.customer_name as CustomerType | undefined;
  const status = data.status || "Active";
  const isUserData = data.source === "Manual" || data.source === "User";

  const icon = getMapMarkerIcon(itemType, status, isUserData, customerName);

  const marker = new google.maps.Marker({
    position: position,
    map: map,
    title: data.item_name || data.location_name || "Infrastructure",
    clickable: true,
    zIndex: 101,
    icon: icon,
  });

  overlays.push(marker);
};

/**
 * Create Customer Marker Overlay
 */
export const createCustomerOverlay = (
  data: any,
  map: google.maps.Map,
  overlays: any[]
) => {
  const position = {
    lat: Number(data.latitude),
    lng: Number(data.longitude),
  };

  const itemType = "Customer" as InfrastructureType;
  const customerName = data.customer_name as CustomerType | undefined;
  const status = data.status || "Active";
  const isUserData = data.source === "Manual" || data.source === "User";

  const icon = getMapMarkerIcon(itemType, status, isUserData, customerName);

  const marker = new google.maps.Marker({
    position: position,
    map: map,
    title:
      data.item_name ||
      data.location_name ||
      data.customer_name ||
      "Customer",
    clickable: true,
    zIndex: 101,
    icon: icon,
  });

  overlays.push(marker);
};

