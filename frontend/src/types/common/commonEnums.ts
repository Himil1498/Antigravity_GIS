// Telecom Industry Specific Types
export type TelecomCompany =
  | "Jio"
  | "Airtel"
  | "Vi"
  | "BSNL"
  | "Idea"
  | "Tata"
  | "Reliance"
  | "Sify"
  | "Optimal Telemedia"
  | "JTM Internet"
  | "Other";

export type NetworkTechnology =
  | "2G"
  | "3G"
  | "4G"
  | "5G"
  | "LTE"
  | "NR"
  | "GSM"
  | "UMTS"
  | "CDMA"
  | "WiMAX"
  | "Fiber";

export type FrequencyBand =
  | "700MHz"
  | "800MHz"
  | "850MHz"
  | "900MHz"
  | "1800MHz"
  | "2100MHz"
  | "2300MHz"
  | "2500MHz"
  | "3500MHz"
  | "26GHz"
  | "mmWave";

export type TowerStatus =
  | "active"
  | "inactive"
  | "maintenance"
  | "error"
  | "planned"
  | "decommissioned";

export type InfrastructureType =
  | "cell_tower"
  | "base_station"
  | "fiber_node"
  | "repeater"
  | "small_cell"
  | "macrocell"
  | "microcell"
  | "picocell"
  | "femtocell"
  | "antenna"
  | "hub"
  | "exchange";

export type SignalQuality =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "no_signal";

export type CoverageType =
  | "urban"
  | "suburban"
  | "rural"
  | "highway"
  | "indoor"
  | "outdoor";

// User Roles and Permissions
// Only 4 roles are used in the system (lowercase - matches database ENUM)
export type UserRole =
  | "admin"
  | "superadmin"
  | "manager"
  | "technician"
  | "user"
  | "developer"
  | (string & {}); // Allow custom roles while keeping intellisense for known roles

export type Permission =
  | "read"
  | "write"
  | "delete"
  | "admin"
  | "all"
  | "manage_team"
  | "manage_users"
  | "manage_towers"
  | "manage_analytics"
  | "export_data"
  | "import_data"
  | "view_reports"
  | "create_reports"
  | "system_config"
  | "users:create"
  | "users:view"
  | "users:update"
  | "users:delete"
  | "towers:create"
  | "towers:read"
  | "towers:update"
  | "towers:delete"
  | "analytics:read"
  | "analytics:export"
  | "settings:read"
  | "settings:update"
  | "audit:read"
  | "map:*"
  | "network:view"
  | "datahub:view"
  | "system:schema:view"
  | "system:schema:query"
  | "system:schema:export"
  | "system:schema:annotate"
  | "dashboard:view";

