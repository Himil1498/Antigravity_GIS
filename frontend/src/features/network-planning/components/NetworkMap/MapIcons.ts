// SVG Paths for robust map icons
// All icons are designed to be used with mask: true for dynamic coloring
// Telco ISP/Provider icons use PNG images (mask: false) for brand-accurate logos

const createSvgIcon = (path: string) => {
  try {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="${path}"/>
      </svg>`.trim();
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  } catch (e) {
    console.error("Failed to create SVG icon", e);
    return "";
  }
};

// Material Design & Custom Paths
export const PATHS = {
  // Basic Shapes
  CIRCLE: "M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2Z",
  SQUARE: "M3,3V21H21V3",
  TRIANGLE: "M1,21H23L12,2",
  HEXAGON:
    "M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.9 12.21,22 12,22C11.79,22 11.59,21.9 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.1 11.79,2 12,2C12.21,2 12.41,2.1 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z",

  // Infrastructure
  TOWER: "M12,2L8,22H16L12,2M12,6V18",
  FIBER:
    "M4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4C7.58,4 4,7.58 4,12M2,12C2,6.48 6.48,2 12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12",
  POLE: "M11,2v20h2V2H11z",
  MANHOLE:
    "M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10-4.48 10-10S17.52,2 12,2zm0,18c-4.41,0-8-3.59-8-8s3.59-8 8-8 8,3.59 8,8-3.59,8-8,8zm0-14c-3.31,0-6,2.69-6,6s2.69,6 6,6 6-2.69 6-6-2.69-6-6-6z", // Ring
  HANDHOLE:
    "M20,6H4V18H20V6M20,4A2,2,0,0,1,22,6V18A2,2,0,0,1,20,20H4A2,2,0,0,1,2,18V6A2,2,0,0,1,4,4H20M12,10A2,2,0,0,1,14,12A2,2,0,0,1,12,14A2,2,0,0,1,10,12A2,2,0,0,1,12,10Z",
  CABINET:
    "M4,2H20A2,2,0,0,1,22,4V20A2,2,0,0,1,20,22H4A2,2,0,0,1,2,20V4A2,2,0,0,1,4,2M6,4V20H10V4H6M14,4V20H18V4H14M11,10H13V14H11V10Z",
  OLT: "M2,2V22H22V2H2M20,20H4V4H20V20Z", // Box
  SPLITTER: "M14,6l5-4v3h3v2h-3v3L14,6z M14,18l5-4v3h3v2h-3v3L14,18z M2,11h8v2H2V11z M10,6h4v12h-4V6z",
  CLOSURE: "M12 2L4 6v12l8 4 8-4V6L12 2zm0 2.2l6 3v9.6l-6 3-6-3V7.2l6-3zM12 9v6M9 12h6",
  ROUTER:
    "M16,13h-3.51c-0.85-3.06-3.44-5.65-6.5-6.5V3H16V13z M2,10.74C3.89,14.61 7.39,18.11 11.26,20H2v-9.26z M12,12A2,2 0 1,1 12,16A2,2 0 1,1 12,12z M17,2h7v21h-7V2z M19,5h3v2h-3V5z M19,9h3v2h-3V9z M19,13h3v2h-3V13z M19,17h3v2h-3V17z",
  SWITCH: 
    "M2,4h20v4H2V4z M4,5h2v2H4V5z M7,5h2v2H7V5z M10,5h2v2H10V5z M13,5h2v2H13V5z M16,5h2v2H16V5z M19,5h1v1h-1V5z M19,7h1v1h-1V7z M2,10h20v4H2V10z M4,11h2v2H4V11z M7,11h2v2H7V11z M10,11h2v2H10V11z M13,11h2v2H13V11z M16,11h2v2H16V11z M19,11h1v1h-1V11z M19,13h1v1h-1V13z M2,16h20v4H2V16z M4,17h2v2H4V17z M7,17h2v2H7V17z M10,17h2v2H10V17z M13,17h2v2H13V17z M16,17h2v2H16V17z M19,17h1v1h-1V17z M19,19h1v1h-1V19z",
  SERVER:
    "M2,2h20v7H2V2z M6,4h2v3H6V4z M9,4h2v3H9V4z M17,4h2v1h-2V4z M17,6h2v1h-2V6z M2,15h20v7H2V15z M6,17h2v3H6V17z M9,17h2v3H9V17z M17,17h2v1h-2V17z M17,19h2v1h-2V19z M12,9h3v6h-3V9z M8,9h3v6H8V9z",
  ANTENNA: "M12,2L2,22h20L12,2z M12,6l6,13H6L12,6z", // Triangle with inner
  BUILDING: "M4 2v20h16V2H4zm14 18H6V4h12v16zM8 6h2v2H8V6zm4 0h2v2h-2V6zm0 4h2v2h-2v-2zM8 10h2v2H8v-2zm0 4h2v2H8v-2zm4 0h2v2h-2v-2z",

  // Customer
  HOUSE: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",

  // Generic Pin
  // Generic Pin
  PIN: "M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5C10.62,11.5 9.5,10.38 9.5,9C9.5,7.62 10.62,6.5 12,6.5C13.38,6.5 14.5,7.62 14.5,9C14.5,10.38 13.38,11.5 12,11.5Z",
  STAR: "M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z",
  FLAG: "M14.4,6L14,4H5V21H7V14H12L12.4,16H19V6H14.4Z",
  HEART:
    "M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z",
  TARGET:
    "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z",
  ANCHOR:
    "M12,4A3,3 0 0,1 15,7H19A1,1 0 0,1 20,8V18A3,3 0 0,1 17,21H7A3,3 0 0,1 4,18V8A1,1 0 0,1 5,7H9A3,3 0 0,1 12,4Z", // Simplified shape
  ZAP: "M11,15H6L13,1V9H18L11,23V15Z",
  TREE: "M10,21V18H3L8,13H5L10,8H7L12,3L17,8H14L19,13H16L21,18H14V21H10Z",

  // New Unique Shapes for System Icons
  DIAMOND: "M12,2L22,12L12,22L2,12Z",
  SHIELD: "M12,1L3,5v6c0,5.55 3.84,10.74 9,12c5.16-1.26 9-6.45 9-12V5L12,1z",
  CLOUD:
    "M19.35,10.04C18.67,6.59 15.64,4 12,4 c-3.11,0-5.87,1.92-7.07,4.71C2.12,8.96 0,11.5 0,14.5c0,3.31 2.69,6 6,6h13c2.76,0 5-2.24 5-5 C24,12.77 21.96,10.51 19.35,10.04z",
  WIFI: "M12.01,21.49L23.64,7c-0.45-0.34-4.93-4-11.64-4C5.28,3 0.81,6.66 0.36,7l11.63,14.49L12.01,21.49z",
  SIGNAL: "M2,22h20V2L2,22z",
  DROP: "M12,2c-5.33,4.55-8,8.48-8,11.8c0,4.98 3.8,8.2 8,8.2s8-3.22 8-8.2C20,10.48 17.33,6.55 12,2z",
  CROSS:
    "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41z",
  RING: "M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10-4.48 10-10S17.52,2 12,2zm0,18c-4.41,0-8-3.59-8-8s3.59-8 8-8 8,3.59 8,8-3.59,8-8,8z",
  OCTAGON: "M7.86,2H16.14L22,7.86V16.14L16.14,22H7.86L2,16.14V7.86L7.86,2Z",
  GRID: "M4,4H8V8H4V4M10,4H14V8H10V4M16,4H20V8H16V4M4,10H8V14H4V10M10,10H14V14H10V10M16,10H20V14H16V10M4,16H8V20H4V16M10,16H14V20H10V16M16,16H20V20H16V16Z",
  FACTORY: "M22,22H2V10l7-3v2l5-2v3l3-1.5V6l5-2V22z",
  BRIEFCASE:
    "M20,6h-4V4c0-1.11-0.89-2-2-2h-4c-1.11,0-2,0.89-2,2v2H4C2.89,6,2,6.89,2,8v10c0,1.11,0.89,2,2,2h16c1.11,0,2-0.89,2-2V8 C22,6.89,21.11,6,20,6z M10,4h4v2h-4V4z M20,18H4V8h16V18z",
  ARROW_UP: "M12,2L22,12H16V22H8V12H2L12,2Z",
  ARROW_DOWN: "M12,22L2,12H8V2H16V12H22L12,22Z",
  PENTAGON: "M12,2L22,9L19,21H5L2,9L12,2Z",
  BUILDING_2:
    "M18,3v18H6V3H18 M18,1H6C4.9,1,4,1.9,4,3v18c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V3C20,1.9,19.1,1,18,1L18,1z M10,19H8v-2h2V19z M10,15H8v-2h2V15z M10,11H8V9h2V11z M10,7H8V5h2V7z M16,19h-2v-2h2V19z M16,15h-2v-2h2V15z M16,11h-2V9h2V11z M16,7h-2V5h2V7z",
  MAP: "M20.5,3l-0.16,0.03L15,5.1L9,3L3.36,4.9C3.15,4.97,3,5.15,3,5.38V20.5c0,0.36,0.36,0.6,0.69,0.49l5.31-2.1l6,2.1l5.64-1.9 c0.21-0.07,0.36-0.25,0.36-0.48V3.5C21,3.14,20.64,2.9,20.5,3z M15,19l-6-2.11V5l6,2.11V19z",
  HOME: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  WORK: "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM10 4h4v2h-4V4z",
  INFO: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  WARNING: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  HELP: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z",
  SETTINGS:
    "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.58 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
  USER: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  GROUP: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",

  // ─── Dashboard KPIs / System Folder Icons ──────────────────────────────────
  // POP - Multi-story telecom exchange building with antenna on roof
  POP_ICON: "M4,21h16V7h-6V3H10V7H4V21zM6,9h4v3H6V9zM14,9h4v3h-4V9zM6,14h4v3H6V14zM14,14h4v3h-4V14zM11,3h2v2h-2V3zM10,1h4v1h-4V1z",
  // Sub POP - Smaller relay station with signal waves
  SUB_POP_ICON: "M7,22h10V10H7V22zM9,12h2v3H9V12zM13,12h2v3h-2V12zM9,17h2v3H9V17zM13,17h2v3h-2V17zM11,4V8h2V4h-2zM8,6c0-2.21,1.79-4,4-4s4,1.79,4,4M6,8c0-3.31,2.69-6,6-6s6,2.69,6,6",
  // Office - Corporate office building with glass facade
  OFFICE_LOCATION_ICON: "M3,22V4c0-1.1,0.9-2,2-2h14c1.1,0,2,0.9,2,2v18H3zM5,4v16h14V4H5zM7,6h3v3H7V6zM12,6h3v3h-3V6zM7,11h3v3H7V11zM12,11h3v3h-3V11zM7,16h3v3H7V16zM12,16h3v3h-3V16z",
  // NNI - Two server boxes connected by cable
  NNI_ICON: "M2,4h8v7H2V4zM14,4h8v7h-8V4zM4,6h4v1H4V6zM4,8h4v1H4V8zM16,6h4v1h-4V6zM16,8h4v1h-4V8zM10,7h4v2h-4V7zM6,13v6h3v-6H6zM15,13v6h3v-6h-3zM9,16h6v2H9V16z",
  // Data Center - Server rack cluster with cooling
  DATA_CENTER_ICON: "M2,2h8v9H2V2zM14,2h8v9h-8V2zM2,13h8v9H2V13zM14,13h8v9h-8V13zM4,4h2v1H4V4zM4,6h2v1H4V6zM8,4h1v1H8V4zM8,6h1v1H8V6zM16,4h2v1h-2V4zM16,6h2v1h-2V6zM20,4h1v1h-1V4zM20,6h1v1h-1V6zM4,15h2v1H4V15zM4,17h2v1H4V17zM8,15h1v1H8V15zM8,17h1v1H8V17zM16,15h2v1h-2V15zM16,17h2v1h-2V17zM20,15h1v1h-1V15zM20,17h1v1h-1V17z",
  // Infra Provider - Cell tower with signal waves
  INFRA_PROVIDER_ICON: "M12,2L9,12h2v10h2V12h2L12,2zM6,8c0-3.31,2.69-6,6-6s6,2.69,6,6M4,10c0-4.42,3.58-8,8-8s8,3.58,8,8M2,12c0-5.52,4.48-10,10-10s10,4.48,10,10",
  // Node - Three connected circles forming a network triangle
  NODE_ICON: "M12,2a3,3,0,1,0,0,6a3,3,0,0,0,0-6zM4,17a3,3,0,1,0,0,6a3,3,0,0,0,0-6zM20,17a3,3,0,1,0,0,6a3,3,0,0,0,0-6zM12,8v2l-6,7M12,10l6,7M6,18h12",
  // Bandwidth BTS - Cell tower with transmission beams
  BANDWIDTH_BTS_ICON: "M12,22V8M9,22h6M8,2l4,6l4-6M6,4l6,8l6-8M4,6l8,10l8-10M10,8h4M9,10h6",

  // ─── ISP / Telecom Provider Icons ──────────────────────────────────────────
  // Airtel - Stylized rising wave/signal bar (brand identity)
  AIRTEL_ICON: "M12,20c-2.5,0-5-1.5-5-5c0-4,5-13,5-13s5,9,5,13C17,18.5,14.5,20,12,20zM12,10c-1,1.5-2.5,4.5-2.5,5.5c0,1.38,1.12,2.5,2.5,2.5s2.5-1.12,2.5-2.5C14.5,14.5,13,11.5,12,10z",
  // Jio - WiFi/signal radiating arcs with center dot
  JIO_ICON: "M12,18a2,2,0,1,1,0-4a2,2,0,0,1,0,4zM8,12a5.64,5.64,0,0,1,8,0l-1.5,1.5a3.5,3.5,0,0,0-5,0L8,12zM5,9a9.9,9.9,0,0,1,14,0L17.5,10.5a7.78,7.78,0,0,0-11,0L5,9zM2,6a14,14,0,0,1,20,0L20.5,7.5A11.9,11.9,0,0,0,3.5,7.5L2,6z",
  // Tata - Bold structured T-shape (corporate identity)
  TATA_ICON: "M2,2h20v5H2V2zM4,3.5h16v2H4V3.5zM8,7h8v14H8V7zM10,9v10h4V9H10z",
  // Sify - Lightning bolt inside a circle (fast connectivity)
  SIFY_ICON: "M12,2A10,10,0,1,0,22,12A10,10,0,0,0,12,2zM12,4A8,8,0,1,1,4,12A8,8,0,0,1,12,4zM13,6L9,13h3v5l4-7H13V6z",
  // Vodafone - Speech bubble / quotation mark (Vi brand)
  VODAFONE_ICON: "M12,2A10,10,0,0,0,2,12a10,10,0,0,0,10,10l3-3A7,7,0,1,1,19,12a7,7,0,0,1-4,6.3L12,22A10,10,0,0,0,22,12A10,10,0,0,0,12,2zM12,7a5,5,0,1,1,0,10A5,5,0,0,1,12,7z",
  // TTSL - Tata Teleservices T-bar with signal
  TTSL_ICON: "M3,3h18v4H3V3zM5,4.5h14v1H5V4.5zM10,7h4v15h-4V7zM12,7v15M2,9c0,0,3-2,10-2s10,2,10,2",
  // BSNL - Telephone with network waves
  BSNL_ICON: "M20,15.5c-1.25,0-2.45-0.2-3.57-0.57c-0.35-0.12-0.75-0.03-1.02,0.24l-2.2,2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.2c0.27-0.27,0.36-0.66,0.24-1.02C8.7,6.45,8.5,5.25,8.5,4c0-0.55-0.45-1-1-1H4c-0.55,0-1,0.45-1,1c0,9.39,7.61,17,17,17c0.55,0,1-0.45,1-1v-3.5C21,15.95,20.55,15.5,20,15.5zM5,5h1.54c0.11,0.93,0.3,1.83,0.58,2.67L5.79,8.97C5.38,7.71,5.12,6.38,5.04,5H5zM19,18.95c-1.38-0.08-2.71-0.34-3.97-0.76l1.3-1.33c0.84,0.28,1.74,0.48,2.67,0.58V18.95z",

  // RailTail - Railway track with telecom pole
  RAILTAIL_ICON: "M4,20h16v2H4V20zM6,20V12h2V20H6zM16,20V12h2V20h-2zM5,12h14M5,16h14M11,2h2v10h-2V2zM9,4h6M9,7h6M11,2L8,5M13,2l3,3",
  // RCOM - Hexagonal network logo
  RCOM_ICON: "M12,1L3,6v12l9,5l9-5V6L12,1zM12,4l6,3.5v9L12,20l-6-3.5v-9L12,4zM12,8a4,4,0,1,0,0,8a4,4,0,0,0,0-8zM12,10a2,2,0,1,1,0,4a2,2,0,0,1,0-4z",
  // PGCIL - Power grid pylon with cables
  PGCIL_ICON: "M12,1L10,8H8L6,22h4l1-8h2l1,8h4L16,8H14L12,1zM3,6h6M15,6h6M4,10h5M15,10h5M6,8l-3,2M18,8l3,2M9,6L6,8M15,6l3,2",
  // JTM Internet - Router/modem with WiFi waves
  JTM_ICON: "M4,14h16v6H4V14zM6,16h2v2H6V16zM10,16h2v2H10V16zM16,16h2v2h-2V16zM12,4a6,6,0,0,1,6,6M12,4a6,6,0,0,0-6,6M12,7a3,3,0,0,1,3,3M12,7a3,3,0,0,0-3,3M12,10v4",
  // Optimal Telemedia - Rising equalizer bars (brand identity)
  OPTIMAL_ICON: "M3,20h2V14H3V20zM7,20h2V10H7V20zM11,20h2V6h-2V20zM15,20h2V12h-2V20zM19,20h2V8h-2V20zM2,22h20v1H2V22z",
};

// ─── Telco Logo Image Paths (served from /telco-logos/) ──────────────────────
// These map ICON_DEFS keys to their PNG asset URLs.
// Used by generateIconAtlas() to draw full-color brand logos.
// Added ?v=2 to bust browser caches so updated logos display immediately.
export const TELCO_LOGO_URLS: Record<string, string> = {
  AIRTEL: process.env.PUBLIC_URL + "/telco-logos/airtel.png?v=3",
  JIO: process.env.PUBLIC_URL + "/telco-logos/jio.png?v=3",
  TATA: process.env.PUBLIC_URL + "/telco-logos/tata.png?v=3",
  VODAFONE: process.env.PUBLIC_URL + "/telco-logos/vodaphone.png?v=3",
  SIFY: process.env.PUBLIC_URL + "/telco-logos/sify.png?v=3",
  TTSL: process.env.PUBLIC_URL + "/telco-logos/ttsl.png?v=3",
  RAILTAIL: process.env.PUBLIC_URL + "/telco-logos/railtel.png?v=3",
  RCOM: process.env.PUBLIC_URL + "/telco-logos/rcom.png?v=3",
  BSNL: process.env.PUBLIC_URL + "/telco-logos/bsnl.png?v=3",

  PGCIL: process.env.PUBLIC_URL + "/telco-logos/pgcil.png?v=3",
  JTM: process.env.PUBLIC_URL + "/telco-logos/jtm_internet.png?v=3",
  OPTIMAL: process.env.PUBLIC_URL + "/telco-logos/optimal_telemedia.png?v=3",
};

// Mappings for all supported types
// Keys MUST match IconPicker.tsx IDs (uppercase for lookup)
export const ICON_DEFS: Record<string, { path: string; color?: number[]; imageUrl?: string }> = {
  // Infrastructure - Active (Red/Pink)
  TOWER: { path: PATHS.TOWER, color: [239, 68, 68, 255] }, // Red-500
  "BTS-STATION": { path: PATHS.TOWER, color: [236, 72, 153, 255] }, // Pink-500
  POLE: { path: PATHS.POLE, color: [244, 63, 94, 255] }, // Rose-500
  ANTENNA: {
    path: "M12,2C6.5,2,2,6.5,2,12S6.5,22,12,22S22,17.5,22,12S17.5,2,12,2M12,20C7.6,20,4,16.4,4,12S7.6,4,12,4S20,7.6,20,12S16.4,20,12,20M7.5,13.5L10.5,10.5L13.5,13.5L16.5,10.5",
    color: [217, 70, 239, 255],
  }, // Fuchsia-500

  // Infrastructure - Fiber/Cabling (Green/Teal)
  FIBER: { path: PATHS.FIBER, color: [16, 185, 129, 255] }, // Emerald-500
  "DARK-FIBER": { path: PATHS.FIBER, color: [16, 185, 129, 255] }, // Alias
  DUCT: {
    path: "M4,3h16c1.1,0,2,0.9,2,2v14c0,1.1-0.9,2-2,2H4c-1.1,0-2-0.9-2-2V5C2,3.9,2.9,3,4,3z M4,7v4h16V7H4z M4,13v4h16v-4H4z",
    color: [20, 184, 166, 255],
  }, // Teal-500
  TRENCH: { path: "M2 19L6 7h12l4 12H2zm6-10l-2.6 8h13.2L16 9H8z M12 3v4 M8 3v4 M16 3v4", color: [13, 148, 136, 255] }, // Teal-600

  // Infrastructure - Passive/Underground (Orange/Amber)
  MANHOLE: { path: PATHS.MANHOLE, color: [249, 115, 22, 255] }, // Orange-500
  HANDHOLE: { path: PATHS.HANDHOLE, color: [245, 158, 11, 255] }, // Amber-500
  CABINET: { path: PATHS.CABINET, color: [234, 88, 12, 255] }, // Orange-600
  SPLITTER: {
    path: PATHS.SPLITTER,
    color: [217, 119, 6, 255],
  }, // Amber-600
  CLOSURE: { path: PATHS.CLOSURE, color: [202, 138, 4, 255] }, // Yellow-600
  JUNCTION: {
    path: "M10,2h4v8h8v4h-8v8h-4v-8H2v-4h8V2z M12,6v6h6v-2h-4V6H12z M12,18v-6H6v2h4v4H12z",
    color: [234, 179, 8, 255],
  }, // Yellow-500
  "PATCH-PANEL": {
    path: "M2,4h20v16H2V4z M4,8h2v2H4V8z M8,8h2v2H8V8z M12,8h2v2H12V8z M16,8h2v2H16V8z M4,14h2v2H4V14z M8,14h2v2H8V14z M12,14h2v2H12V14z M16,14h2v2H16V14z",
    color: [251, 146, 60, 255],
  }, // Orange-400

  // Infrastructure - Active Equipment (Purple/Indigo/Blue)
  OLT: { path: PATHS.OLT, color: [139, 92, 246, 255] }, // Violet-500
  ROUTER: { path: PATHS.ROUTER, color: [99, 102, 241, 255] }, // Indigo-500
  SWITCH: { path: PATHS.SWITCH, color: [79, 70, 229, 255] }, // Indigo-600
  SERVER: { path: PATHS.SERVER, color: [124, 58, 237, 255] }, // Violet-600
  FIREWALL: {
    path: "M12,12.5C12,12.5 12,12.5 12,12.5M12,2L4,5V11.09C4,16.14 7.41,20.85 12,22C16.59,20.85 20,16.14 20,11.09V5L12,2M11,14H9V16H11V14M15,14H13V16H15V14M11,10H9V12H11V10M15,10H13V12H15V10M11,6H9V8H11V6M15,6H13V8H15V6Z",
    color: [239, 68, 68, 255]
  },
  ONT: { path: "M4,6h16a2,2 0 0,1 2,2v8a2,2 0 0,1-2,2H4a2,2 0 0,1-2-2V8a2,2 0 0,1 2-2zm0,2v8h16V8H4zm4,2h2v2H8v-2zm4,0h2v2h-2v-2zm-8,4h12v2H4v-2z", color: [167, 139, 250, 255] }, // Violet-400
  REPEATER: {
    path: "M12,2L6,12h4v8h4v-8h4L12,2z M12,6l2.5,5h-5L12,6z M6,20h12v2H6V20z",
    color: [192, 132, 252, 255],
  },
  AMPLIFIER: {
    path: "M2,2v20h20L2,2z M6,16h8v2H6V16z M6,12h6v2H6V12z",
    color: [147, 51, 234, 255],
  },

  // Power & Facilities (Gray/Slate)
  UPS: {
    path: "M4,2h16v20H4V2z M11,7l3,5h-2v5l-3-5h2V7z",
    color: [234, 179, 8, 255],
  }, // Yellow (Power)
  GENERATOR: {
    path: "M4,4h16v16H4V4z M8,10l4-4l4,4H8z M8,14l4,4l4-4H8z",
    color: [202, 138, 4, 255],
  },
  TRANSFORMER: {
    path: "M6,2v20h4V2H6z M14,2v20h4V2H14z",
    color: [100, 116, 139, 255],
  }, // Slate
  PDU: {
    path: "M2,10h20v4H2V10z M4,11h2v2H4V11z M8,11h2v2H8V11z M12,11h2v2H12V11z M16,11h2v2H16V11z",
    color: [71, 85, 105, 255],
  },
  RACK: { path: PATHS.SERVER, color: [51, 65, 85, 255] }, // Slate-700
  DATACENTER: { path: PATHS.DATA_CENTER_ICON, color: [30, 41, 59, 255] }, // Slate-800
  POP: { path: PATHS.POP_ICON, color: [239, 68, 68, 255] }, // Red-500
  "SUB-POP": { path: PATHS.SUB_POP_ICON, color: [239, 68, 68, 255] }, // Red-500
  "BANDWIDTH-DROP-BTS": { path: PATHS.BANDWIDTH_BTS_ICON, color: [14, 165, 233, 255] }, // Sky-500
  NNI: { path: PATHS.NNI_ICON, color: [99, 102, 241, 255] }, // Indigo-500
  "OFFICE-LOCATIONS": { path: PATHS.OFFICE_LOCATION_ICON, color: [20, 184, 166, 255] }, // Teal-500
  "DATA-CENTERS": { path: PATHS.DATA_CENTER_ICON, color: [30, 41, 59, 255] }, // Slate Cloud
  NODE: { path: PATHS.NODE_ICON, color: [236, 72, 153, 255] }, // Pink-500
  "INFRA-PROVIDER": { path: PATHS.INFRA_PROVIDER_ICON, color: [249, 115, 22, 255] }, // Orange-500
  
  // Infra Providers (Tower Variations)
  ELEVOR: { path: PATHS.ARROW_UP, color: [234, 179, 8, 255] }, // Yellow Arrow Up
  INDUS: { path: PATHS.STAR, color: [249, 115, 22, 255] }, // Orange Star
  ASCEND: { path: PATHS.PENTAGON, color: [22, 163, 74, 255] }, // Green Pentagon

  // Infra Regions (Child Folders)
  "INFRA-REGION": { path: PATHS.FACTORY, color: [71, 85, 105, 255] },
  "ELEVOR-REGION": { path: PATHS.ARROW_UP, color: [234, 179, 8, 255] },
  "INDUS-REGION": { path: PATHS.STAR, color: [249, 115, 22, 255] },
  "ASCEND-REGION": { path: PATHS.PENTAGON, color: [22, 163, 74, 255] },

  // Generic Region (Fallback for States without Provider Name)
  REGION: { path: PATHS.MAP, color: [99, 102, 241, 255] }, // Indigo Map

  // Buildings & Locations
  EXCHANGE: {
    path: "M12,2L2,10h3v12h14V10h3L12,2z M12,5l5,4v11H7V9L12,5z M10,12h4v8h-4V12z M16,12h2v3h-2V12z M6,12h2v3H6V12z",
    color: [59, 130, 246, 255],
  }, // Blue-500
  BUILDING: {
    path: PATHS.BUILDING,
    color: [37, 99, 235, 255],
  }, // Blue-600
  WAREHOUSE: {
    path: "M2,22V8l10-6l10,6v14H2z M4,10l8-4.8L20,10v10h-6v-6h-4v6H4V10z M11,16h2v4h-2V16z M6,12h2v2H6V12z M16,12h2v2h-2V12z",
    color: [29, 78, 216, 255],
  }, // Blue-700
  MICROWAVE: {
    path: "M12,2C6.5,2,2,6.5,2,12c0,5.5,4.5,10,10,10s10-4.5,10-10C22,6.5,17.5,2,12,2z M12,20c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S16.4,20,12,20z M12,7c-2.8,0-5,2.2-5,5s2.2,5,5,5s5-2.2,5-5S14.8,7,12,7z",
    color: [14, 165, 233, 255],
  }, // Sky-500
  SATELLITE: {
    path: "M12,2L2,12l2,2l8-8l8,8l2-2L12,2z M12,6L6,12h12L12,6z",
    color: [6, 182, 212, 255],
  }, // Cyan-500

  // Customers / ISPs — Now using PNG logos (imageUrl) with SVG path as fallback
  AIRTEL: { path: PATHS.AIRTEL_ICON, color: [220, 38, 38, 255], imageUrl: TELCO_LOGO_URLS.AIRTEL },
  TATA: { path: PATHS.TATA_ICON, color: [30, 64, 175, 255], imageUrl: TELCO_LOGO_URLS.TATA },
  JIO: { path: PATHS.JIO_ICON, color: [14, 165, 233, 255], imageUrl: TELCO_LOGO_URLS.JIO },
  VODAFONE: { path: "M12,2C7.58,2,4,5.58,4,10c0,6,8,12,8,12s8-6,8-12C20,5.58,16.42,2,12,2zM12,13a3,3,0,1,1,0-6a3,3,0,0,1,0,6z", color: [185, 28, 28, 255], imageUrl: TELCO_LOGO_URLS.VODAFONE },
  SIFY: { path: PATHS.SIFY_ICON, color: [22, 163, 74, 255], imageUrl: TELCO_LOGO_URLS.SIFY },
  TTSL: { path: PATHS.TTSL_ICON, color: [30, 64, 175, 255], imageUrl: TELCO_LOGO_URLS.TTSL },
  RAILTAIL: { path: PATHS.RAILTAIL_ICON, color: [159, 18, 57, 255], imageUrl: TELCO_LOGO_URLS.RAILTAIL },
  RCOM: { path: PATHS.RCOM_ICON, color: [88, 28, 135, 255], imageUrl: TELCO_LOGO_URLS.RCOM },
  BSNL: { path: PATHS.BSNL_ICON, color: [6, 182, 212, 255], imageUrl: TELCO_LOGO_URLS.BSNL },

  PGCIL: { path: PATHS.PGCIL_ICON, color: [234, 179, 8, 255], imageUrl: TELCO_LOGO_URLS.PGCIL },
  JTM: { path: PATHS.JTM_ICON, color: [249, 115, 22, 255], imageUrl: TELCO_LOGO_URLS.JTM },
  OPTIMAL: { path: PATHS.OPTIMAL_ICON, color: [99, 102, 241, 255], imageUrl: TELCO_LOGO_URLS.OPTIMAL },

  // Generic
  DEFAULT: { path: PATHS.PIN, color: [156, 163, 175, 255] }, // Gray-400
  "LAYER-GROUP": { path: PATHS.SQUARE, color: [107, 114, 128, 255] }, // Gray-500

  // Generic Icons (Tier 2 User Selection)
  STAR: { path: PATHS.STAR, color: [234, 179, 8, 255] }, // Yellow
  STAR_BLUE: { path: PATHS.STAR, color: [59, 130, 246, 255] }, // Blue
  STAR_RED: { path: PATHS.STAR, color: [239, 68, 68, 255] }, // Red
  STAR_GREEN: { path: PATHS.STAR, color: [34, 197, 94, 255] }, // Green
  
  FLAG: { path: PATHS.FLAG, color: [239, 68, 68, 255] }, // Red
  FLAG_BLUE: { path: PATHS.FLAG, color: [59, 130, 246, 255] }, // Blue
  FLAG_GREEN: { path: PATHS.FLAG, color: [34, 197, 94, 255] }, // Green
  FLAG_YELLOW: { path: PATHS.FLAG, color: [234, 179, 8, 255] }, // Yellow
  
  PIN_RED: { path: PATHS.PIN, color: [239, 68, 68, 255] }, // Red
  PIN_BLUE: { path: PATHS.PIN, color: [59, 130, 246, 255] }, // Blue
  PIN_GREEN: { path: PATHS.PIN, color: [34, 197, 94, 255] }, // Green
  PIN_YELLOW: { path: PATHS.PIN, color: [234, 179, 8, 255] }, // Yellow

  TARGET: { path: PATHS.TARGET, color: [249, 115, 22, 255] }, // Orange
  TARGET_BLUE: { path: PATHS.TARGET, color: [59, 130, 246, 255] }, // Blue
  TARGET_GREEN: { path: PATHS.TARGET, color: [34, 197, 94, 255] }, // Green

  ANCHOR: { path: PATHS.ANCHOR, color: [59, 130, 246, 255] }, // Blue
  ZAP: { path: PATHS.ZAP, color: [234, 179, 8, 255] }, // Yellow
  TREE: { path: PATHS.TREE, color: [22, 163, 74, 255] }, // Green
  TRIANGLE: { path: PATHS.TRIANGLE, color: [99, 102, 241, 255] }, // Indigo
  SQUARE: { path: PATHS.SQUARE, color: [139, 92, 246, 255] }, // Violet
  HEXAGON: { path: PATHS.HEXAGON, color: [14, 165, 233, 255] }, // Sky
  
  DIAMOND: { path: PATHS.DIAMOND, color: [139, 92, 246, 255] }, // Violet
  SHIELD: { path: PATHS.SHIELD, color: [16, 185, 129, 255] }, // Emerald
  CLOUD: { path: PATHS.CLOUD, color: [14, 165, 233, 255] }, // Sky
  WIFI: { path: PATHS.WIFI, color: [99, 102, 241, 255] }, // Indigo
  SIGNAL: { path: PATHS.SIGNAL, color: [34, 197, 94, 255] }, // Green
  DROP: { path: PATHS.DROP, color: [6, 182, 212, 255] }, // Cyan
  CROSS: { path: PATHS.CROSS, color: [239, 68, 68, 255] }, // Red
  RING: { path: PATHS.RING, color: [236, 72, 153, 255] }, // Pink
  OCTAGON: { path: PATHS.OCTAGON, color: [245, 158, 11, 255] }, // Amber

  // Color variants for shapes
  DIAMOND_BLUE: { path: PATHS.DIAMOND, color: [59, 130, 246, 255] },
  DIAMOND_RED: { path: PATHS.DIAMOND, color: [239, 68, 68, 255] },
  DIAMOND_GREEN: { path: PATHS.DIAMOND, color: [34, 197, 94, 255] },

  SHIELD_BLUE: { path: PATHS.SHIELD, color: [59, 130, 246, 255] },
  SHIELD_RED: { path: PATHS.SHIELD, color: [239, 68, 68, 255] },
  SHIELD_YELLOW: { path: PATHS.SHIELD, color: [234, 179, 8, 255] },

  HEXAGON_RED: { path: PATHS.HEXAGON, color: [239, 68, 68, 255] },
  HEXAGON_GREEN: { path: PATHS.HEXAGON, color: [34, 197, 94, 255] },
  HEXAGON_YELLOW: { path: PATHS.HEXAGON, color: [234, 179, 8, 255] },

  CLOUD_BLUE: { path: PATHS.CLOUD, color: [59, 130, 246, 255] },
  CLOUD_GREEN: { path: PATHS.CLOUD, color: [34, 197, 94, 255] },

  RING_BLUE: { path: PATHS.RING, color: [59, 130, 246, 255] },
  RING_RED: { path: PATHS.RING, color: [239, 68, 68, 255] },
  RING_GREEN: { path: PATHS.RING, color: [34, 197, 94, 255] },

  OCTAGON_RED: { path: PATHS.OCTAGON, color: [239, 68, 68, 255] },
  OCTAGON_BLUE: { path: PATHS.OCTAGON, color: [59, 130, 246, 255] },

  TRIANGLE_RED: { path: PATHS.TRIANGLE, color: [239, 68, 68, 255] },
  TRIANGLE_GREEN: { path: PATHS.TRIANGLE, color: [34, 197, 94, 255] },
  TRIANGLE_YELLOW: { path: PATHS.TRIANGLE, color: [234, 179, 8, 255] },

  SQUARE_RED: { path: PATHS.SQUARE, color: [239, 68, 68, 255] },
  SQUARE_BLUE: { path: PATHS.SQUARE, color: [59, 130, 246, 255] },
  SQUARE_GREEN: { path: PATHS.SQUARE, color: [34, 197, 94, 255] },

  DROP_BLUE: { path: PATHS.DROP, color: [59, 130, 246, 255] },
  DROP_GREEN: { path: PATHS.DROP, color: [34, 197, 94, 255] },
  DROP_RED: { path: PATHS.DROP, color: [239, 68, 68, 255] },

  // New unique shapes
  PENTAGON: { path: PATHS.PENTAGON, color: [168, 85, 247, 255] }, // Purple
  PENTAGON_BLUE: { path: PATHS.PENTAGON, color: [59, 130, 246, 255] },
  PENTAGON_GREEN: { path: PATHS.PENTAGON, color: [34, 197, 94, 255] },

  GRID: { path: PATHS.GRID, color: [99, 102, 241, 255] }, // Indigo
  GRID_GREEN: { path: PATHS.GRID, color: [34, 197, 94, 255] },

  ARROW_UP: { path: PATHS.ARROW_UP, color: [16, 185, 129, 255] }, // Emerald
  ARROW_DOWN: { path: PATHS.ARROW_DOWN, color: [239, 68, 68, 255] }, // Red

  BRIEFCASE: { path: PATHS.BRIEFCASE, color: [107, 114, 128, 255] }, // Gray
  BRIEFCASE_BLUE: { path: PATHS.BRIEFCASE, color: [59, 130, 246, 255] },

  MAP_ICON: { path: PATHS.MAP, color: [99, 102, 241, 255] }, // Indigo
  HOME: { path: PATHS.HOME, color: [249, 115, 22, 255] }, // Orange
  HOME_BLUE: { path: PATHS.HOME, color: [59, 130, 246, 255] },

  FACTORY: { path: PATHS.FACTORY, color: [100, 116, 139, 255] }, // Slate
  FACTORY_RED: { path: PATHS.FACTORY, color: [239, 68, 68, 255] },

  // Generic Operations
  WORK: { path: PATHS.WORK, color: [249, 115, 22, 255] }, // Orange
  INFO: { path: PATHS.INFO, color: [59, 130, 246, 255] }, // Blue
  WARNING: { path: PATHS.WARNING, color: [239, 68, 68, 255] }, // Red
  HELP: { path: PATHS.HELP, color: [168, 85, 247, 255] }, // Purple
  SETTINGS: { path: PATHS.SETTINGS, color: [107, 114, 128, 255] }, // Gray

  // Infrastructure Updates
  INFRASTRUCTURE: { path: PATHS.GRID, color: [6, 182, 212, 255] }, // Cyan-500 Grid/Network
  CUSTOMER: { path: PATHS.USER, color: [139, 92, 246, 255] }, // Violet-500 User (Replaces House)
};

// Indian States and UTs for Icon Matching
export const STATES_AND_UTS = [
  "ANDAMAN AND NICOBAR ISLANDS",
  "ANDHRA PRADESH",
  "ARUNACHAL PRADESH",
  "ASSAM",
  "BIHAR",
  "CHANDIGARH",
  "CHHATTISGARH",
  "DADRA AND NAGAR HAVELI",
  "DAMAN AND DIU",
  "DELHI",
  "GOA",
  "GUJARAT",
  "HARYANA",
  "HIMACHAL PRADESH",
  "JAMMU AND KASHMIR",
  "JHARKHAND",
  "KARNATAKA",
  "KERALA",
  "LADAKH",
  "LAKSHADWEEP",
  "MADHYA PRADESH",
  "MAHARASHTRA",
  "MANIPUR",
  "MEGHALAYA",
  "MIZORAM",
  "NAGALAND",
  "ODISHA",
  "PUDUCHERRY",
  "PUNJAB",
  "RAJASTHAN",
  "SIKKIM",
  "TAMIL NADU",
  "TELANGANA",
  "TRIPURA",
  "UTTAR PRADESH",
  "UTTARAKHAND",
  "WEST BENGAL",
];

// Generate Icons Object
const ICONS: Record<
  string,
  { url: string; width: number; height: number; mask: boolean }
> = {};
Object.keys(ICON_DEFS).forEach((key) => {
  ICONS[key] = {
    url: createSvgIcon(ICON_DEFS[key].path),
    width: 24,
    height: 24,
    mask: true,
  };
});

export const getIconKey = (type: string, props: { properties?: Record<string, string>; status?: string; icon_type?: string } = {}): string => {
  let t = type?.toLowerCase() || "";

  // 0. Ignore "DEFAULT" or generic types to force property analysis
  if (t === "default" || t === "layer-group" || t === "processing") {
    t = "";
  }

  const upperType = type?.toUpperCase();
  // 1. Strict Mapping (if type matches exactly and isn't one of the ignored ones)
  if (upperType && ICON_DEFS[upperType] && t !== "") {
    return upperType;
  }

  // 2. Fallback: Parse 'layer-group', 'processing', 'default', or generic text
  if (!t) {
    // Safe property access helper
    const getProp = (key: string) => {
      if (!props) return null;
      if ((props as Record<string, string>)[key]) return (props as Record<string, string>)[key];
      if (props.properties) {
        if (typeof props.properties === "object" && (props.properties as Record<string, string>)[key])
          return (props.properties as Record<string, string>)[key];
        try {
          const parsed =
            typeof props.properties === "string"
              ? JSON.parse(props.properties)
              : props.properties;
          return parsed?.[key];
        } catch {
          return null;
        }
      }
      return null;
    };

    const name = (getProp("name") || "").toLowerCase();
    const desc = (getProp("description") || "").toLowerCase();
    const style = (getProp("styleUrl") || "").toLowerCase();
    const infraType = (getProp("infra_type") || "").toLowerCase();
    const layerName = (getProp("layer") || "").toLowerCase();

    // Combine all potential keywords
    t = `${name} ${desc} ${style} ${infraType} ${layerName}`;
  }

  // 3. Keyword Matching (Fallback)
  // Specific exclusions first
  const tLower = t.toLowerCase();
  if (tLower.includes("fiber") || tLower.includes("cable") || tLower.includes("duct"))
    return "FIBER";

  // Infrastructure
  if (
    tLower.includes("tower") ||
    tLower.includes("site") ||
    tLower.includes("enb") ||
    tLower.includes("bts")
  )
    return "TOWER";
  if (tLower.includes("manhole") || tLower.includes("mh")) return "MANHOLE";
  if (tLower.includes("handhole") || tLower.includes("hh")) return "HANDHOLE";
  if (tLower.includes("pole")) return "POLE";
  if (tLower.includes("cabinet")) return "CABINET";
  if (tLower.includes("closure") || tLower.includes("joint")) return "CLOSURE";
  if (tLower.includes("splitter")) return "SPLITTER";
  if (tLower.includes("olt")) return "OLT";
  if (tLower.includes("ont")) return "ONT";
  if (tLower.includes("router")) return "ROUTER";
  if (tLower.includes("switch")) return "SWITCH";

  // Facilities
  if (tLower.includes("pop")) return "POP";
  if (tLower.includes("datacenter") || tLower.includes("data center"))
    return "DATACENTER";
  if (tLower.includes("nni")) return "NNI";
  if (tLower.includes("node")) return "NODE";
  if (tLower.includes("office")) return "OFFICE-LOCATIONS";
  if (tLower.includes("infra provider")) return "INFRA-PROVIDER";
  if (tLower.includes("bandwidth")) return "BANDWIDTH-DROP-BTS";

  // Customer
  if (
    tLower.includes("customer") ||
    tLower.includes("building") ||
    tLower.includes("home") ||
    tLower.includes("house")
  )
    return "CUSTOMER";
  if (tLower.includes("airtel")) return "AIRTEL";
  if (tLower.includes("jio")) return "JIO";
  if (tLower.includes("tata")) return "TATA";
  if (tLower.includes("vodafone") || tLower.includes("vi ")) return "VODAFONE";
  if (tLower.includes("bsnl")) return "BSNL";

  return "DEFAULT";
};

export const getIconMapping = (type: string, props: { properties?: Record<string, string>; status?: string; icon_type?: string } = {}) => {
  const key = getIconKey(type, props);
  if (ICONS[key]) {
    return ICONS[key];
  }
  return ICONS.DEFAULT;
};

export const getIconColor = (
  type: string,
  props: { properties?: Record<string, string>; status?: string; icon_type?: string } = {},
): [number, number, number, number] => {
  let t = type?.toUpperCase() || "";

  // 1. Explicit color defined in Defs
  if (ICON_DEFS[t] && ICON_DEFS[t].color) {
    return ICON_DEFS[t].color as [number, number, number, number];
  }

  // 2. Generic Category Colors
  t = type?.toLowerCase() || "";
  // Same fallback for text analysis
  if (!t || t === "layer-group" || t === "processing") {
    // Re-use logic or simplicity:
    return [80, 80, 80, 255];
  }

  if (t.includes("tower") || t.includes("pole") || t.includes("mast"))
    return [255, 0, 0, 255]; // Red
  if (t.includes("customer") || t.includes("house")) return [0, 128, 255, 255]; // Blue
  if (t.includes("fiber") || t.includes("cable")) return [0, 200, 0, 255]; // Green
  if (t.includes("manhole") || t.includes("handhole")) return [100, 50, 0, 255]; // Brown
  if (t.includes("splitter") || t.includes("closure"))
    return [255, 165, 0, 255]; // Orange
  if (t.includes("olt") || t.includes("server")) return [128, 0, 128, 255]; // Purple

  return [80, 80, 80, 255];
};

export const ICON_CATEGORIES = ["TOWER", "FIBER", "CUSTOMER", "EQUIPMENT"]; // Keep for legacy
export const getIconCategory = (type: string) => "ALL"; // Deprecated

// 🚀 Performance Optimization: Generate Texture Atlas
// Instead of many Base64 textures per tile, we create ONE canvas atlas.
// Phase 1 (sync): Draw all SVG path icons immediately.
// Phase 2 (async): Load PNG telco logos and overdraw their atlas slots.

// ── Helper: Load a single image as a Promise ────────────────────────────────
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    // Do not set crossOrigin="anonymous" for local assets, it triggers CORS rejection in Canvas.
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });

// ── Synchronous atlas (SVG paths only) — used as initial render ─────────────
export const generateIconAtlas = (): {
  atlas: HTMLCanvasElement;
  mapping: Record<
    string,
    { x: number; y: number; width: number; height: number; mask: boolean }
  >;
} => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = 64; // High res for icons
  const keys = Object.keys(ICON_DEFS);
  const cols = 8;
  const rows = Math.ceil(keys.length / cols);

  canvas.width = cols * size;
  canvas.height = rows * size;

  const mapping: Record<string, any> = {};

  keys.forEach((key, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * size;
    const y = row * size;

    // Draw SVG path icon (synchronous via Path2D)
    if (ctx) {
      ctx.save();
      ctx.translate(x + size / 2, y + size / 2);
      ctx.scale(2, 2);
      ctx.translate(-12, -12);

      const path = new Path2D(ICON_DEFS[key].path);
      ctx.fillStyle = "white";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1.2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.fill(path);
      ctx.stroke(path);
      ctx.restore();
    }

    // Telco logos use mask:false (full-color images), others use mask:true (tinted SVG)
    const isTelcoLogo = !!ICON_DEFS[key].imageUrl;
    mapping[key] = {
      x,
      y,
      width: size,
      height: size,
      mask: !isTelcoLogo,
    };
  });

  return { atlas: canvas, mapping };
};

// ── Async atlas upgrade: Loads PNG logos and overdraws telco icon slots ──────
// Call this after mount; when resolved, replace the atlas canvas in deck.gl.
export const generateIconAtlasAsync = async (): Promise<{
  atlas: HTMLCanvasElement;
  mapping: Record<
    string,
    { x: number; y: number; width: number; height: number; mask: boolean }
  >;
}> => {
  // Start with the sync version (all SVG paths drawn)
  const { atlas: canvas, mapping } = generateIconAtlas();
  const ctx = canvas.getContext("2d");
  if (!ctx) return { atlas: canvas, mapping };

  const size = 64;
  const keys = Object.keys(ICON_DEFS);

  // Collect telco logo load promises
  const logoLoadTasks: Promise<void>[] = [];

  keys.forEach((key, index) => {
    const def = ICON_DEFS[key];
    if (!def.imageUrl) return; // Skip non-image icons

    const slot = mapping[key];
    if (!slot) return;

    const task = loadImage(def.imageUrl)
      .then((img) => {
        // Clear the SVG fallback from this slot
        ctx.clearRect(slot.x, slot.y, size, size);

        // Draw the PNG logo, fitting it within the slot with 4px padding
        const pad = 4;
        const drawSize = size - pad * 2;
        const imgAspect = img.width / img.height;
        let drawW = drawSize;
        let drawH = drawSize;

        if (imgAspect > 1) {
          drawH = drawSize / imgAspect;
        } else {
          drawW = drawSize * imgAspect;
        }

        const offsetX = slot.x + (size - drawW) / 2;
        const offsetY = slot.y + (size - drawH) / 2;

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        slot.mask = false;
        console.log(`  ✅ Loaded telco logo: ${key}`);
      })
      .catch((err) => {
        console.warn(`  ⚠️ Logo load failed for ${key}, keeping SVG fallback:`, err.message);
      });

    logoLoadTasks.push(task);
  });

  await Promise.allSettled(logoLoadTasks);
  console.log(`🎨 Icon atlas ready: ${keys.length} icons, ${logoLoadTasks.length} telco logos`);

  return { atlas: canvas, mapping };
};

export const getFolderIconKey = (
  folder: { name: string; default_icon?: string; type?: string } | null,
  parentName?: string,
): string | null => {
  if (!folder || !folder.name) return null;

  const name = folder.name.toUpperCase().trim();
  const parent = parentName?.toUpperCase().trim() || "";

  if (folder.type === "POP") return "POP";
  if (folder.type === "Customer") return "CUSTOMER";

  if (name.includes("VODA") || name.includes("VODAPHONE") || name.includes("VODAFONE")) return "VODAFONE";
  if (name.includes("AIRTEL") || name.includes("AIR ")) return "AIRTEL";
  if (name.includes("JIO")) return "JIO";
  if (name.includes("TATA")) return "TATA";
  if (name.includes("BSNL")) return "BSNL";
  if (name.includes("SIFY")) return "SIFY";
  if (name.includes("TTSL")) return "TTSL";
  if (name.includes("RAIL")) return "RAILTAIL";
  if (name.includes("RCOM")) return "RCOM";
  if (name.includes("JTM")) return "JTM";
  if (name.includes("OPTIMAL")) return "OPTIMAL";
  if (name.includes("PGCIL")) return "PGCIL";

  if (name.includes("SUB POP") || name.includes("SUB-POP")) return "SUB-POP";
  if (name.includes("POP")) return "POP";
  if (name.includes("BANDWIDTH")) return "BANDWIDTH-DROP-BTS";
  if (name.includes("BTS")) return "BTS-STATION";
  if (name.includes("TOWER") || name.includes("SITE")) return "TOWER";
  if (name.includes("NNI")) return "NNI";
  if (name.includes("DATA CENTER") || name.includes("DATACENTER")) return "DATACENTER";
  if (name.includes("OFFICE")) return "OFFICE-LOCATIONS";
  if (name.includes("NODE")) return "NODE";
  if (name === "INFRASTRUCTURE") return "INFRASTRUCTURE";
  if (name === "INFRA PROVIDER" || name === "INFRA-PROVIDER") return "INFRA-PROVIDER";
  if (name.includes("CUSTOMER")) return "CUSTOMER";
  if (name.includes("DARK FIBER") || name.includes("DARK-FIBER")) return "FIBER";

  if (ICON_DEFS[name]) return name;

  if (folder.default_icon) return folder.default_icon;
  if (name === "ELEVOR") return "ELEVOR";
  if (name === "INDUS") return "INDUS";
  if (name === "ASCEND") return "ASCEND";

  if (name.includes("ELEVOR")) return "ELEVOR-REGION";
  if (name.includes("INDUS")) return "INDUS-REGION";
  if (name.includes("ASCEND")) return "ASCEND-REGION";
  if (name.includes("INFRA")) return "INFRA-REGION";

  if (STATES_AND_UTS.some(state => name.includes(state))) return "REGION";

  if (parent === "ASCEND") return "ASCEND";
  if (parent === "ELEVOR") return "ELEVOR";
  if (parent === "INDUS") return "INDUS";
  if (parent === "DARK FIBER" || parent === "DARK-FIBER") return "FIBER";

  return null;
};
