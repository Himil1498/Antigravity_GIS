
import type {
  BaseEntity,
  Coordinates,
  TelecomCompany,
  NetworkTechnology,
  FrequencyBand,
  TowerStatus,
  InfrastructureType,
  IndianState,
  DataQuality,
} from '../common/index';

// ============================================================================
// Core Infrastructure Types
// ============================================================================

export interface TelecomTower extends BaseEntity {
  name: string;
  type: InfrastructureType;
  position: Coordinates;
  status: TowerStatus;
  company: TelecomCompany;

  // Physical specifications
  height: number; // in meters
  structure_type: 'monopole' | 'lattice' | 'concealed' | 'rooftop' | 'water_tank' | 'building';
  foundation_type: 'concrete' | 'steel' | 'guyed' | 'self_supporting';

  // Technical specifications
  frequency_bands: FrequencyBand[];
  technologies: NetworkTechnology[];
  max_capacity: number; // in users/Mbps
  power_consumption: number; // in watts
  backup_power: {
    type: 'battery' | 'generator' | 'solar' | 'hybrid';
    capacity: number; // in hours
    auto_start: boolean;
  };

  // Coverage information
  coverage_radius: number; // in meters
  azimuth_angles: number[]; // antenna directions
  tilt_angles: number[]; // antenna tilts

  // Administrative data
  license_number: string;
  installation_date: string;
  last_maintenance: string;
  next_maintenance: string;
  maintenance_contract: string;

  // Location details
  address: {
    street: string;
    city: string;
    state: IndianState;
    pincode: string;
    landmark?: string;
  };
  land_details: {
    ownership: 'owned' | 'leased' | 'shared';
    lease_expiry?: string;
    area: number; // in sq meters
    cost_per_month?: number;
  };

  // Technical specifications
  equipment: TowerEquipment[];
  antennas: AntennaDetails[];

  // Compliance and safety
  compliance_certificates: ComplianceCertificate[];
  safety_measures: SafetyMeasure[];
  environmental_clearance: boolean;

  // Performance metrics
  performance: TowerPerformance;

  // Connectivity
  backhaul: BackhaulConnection[];

  // Additional metadata
  photos: string[];
  documents: string[];
  notes: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';

  // Data quality
  data_quality: DataQuality;
}

export interface TowerEquipment {
  id: string;
  type: 'bts' | 'rru' | 'antenna' | 'combiner' | 'amplifier' | 'filter' | 'cabinet' | 'other';
  manufacturer: string;
  model: string;
  serial_number: string;
  installation_date: string;
  warranty_expiry: string;
  status: 'active' | 'inactive' | 'maintenance' | 'faulty';
  specifications: Record<string, any>;
}

export interface AntennaDetails {
  id: string;
  type: 'panel' | 'omni' | 'yagi' | 'parabolic' | 'sector';
  frequency_range: string;
  gain: number; // in dBi
  azimuth: number; // in degrees
  tilt: number; // in degrees
  height_agl: number; // height above ground level
  polarization: 'vertical' | 'horizontal' | 'circular' | 'dual';
  manufacturer: string;
  model: string;
}

export interface ComplianceCertificate {
  type: 'dot' | 'pollution_board' | 'fire_safety' | 'structural' | 'emi' | 'other';
  certificate_number: string;
  issued_by: string;
  issue_date: string;
  expiry_date: string;
  status: 'valid' | 'expired' | 'pending_renewal';
  document_url?: string;
}

export interface SafetyMeasure {
  type: 'lightning_arrester' | 'earthing' | 'fire_extinguisher' | 'safety_signage' | 'fencing' | 'security';
  description: string;
  installation_date: string;
  last_inspection: string;
  next_inspection: string;
  status: 'compliant' | 'non_compliant' | 'needs_attention';
}

export interface TowerPerformance {
  uptime: number; // percentage
  throughput: number; // in Mbps
  latency: number; // in ms
  packet_loss: number; // percentage
  active_users: number;
  peak_users: number;
  signal_strength: number; // in dBm
  quality_index: number; // 0-100
  last_measured: string;
}

export interface BackhaulConnection {
  id: string;
  type: 'fiber' | 'microwave' | 'satellite' | 'copper';
  provider: string;
  bandwidth: number; // in Mbps
  latency: number; // in ms
  redundancy: boolean;
  cost_per_month: number;
  contract_expiry: string;
  status: 'active' | 'inactive' | 'backup';
}

