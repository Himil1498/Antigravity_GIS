// ===================================
// Infrastructure and Imports
// ===================================

export type InfrastructureType =
  | "POP"
  | "Sub POP"
  | "BTS-CO-LO"
  | "Bandwidth BTS"
  | "Office Location"
  | "NNI"
  | "Data Center"
  | "Customer";
export type InfrastructureSource = "KML" | "Manual";
export type CustomerType =
  | "Reliance Jio Infocomm Limited"
  | "Vodafone Idea Limited"
  | "SIFY Technologies Limited"
  | "Tata Communications Limited"
  | "Bharti Airtel Limited";

export interface Infrastructure {
  id: string;
  type: InfrastructureType;
  name: string;
  uniqueId: string; // e.g., "POP.3mRVeZ" or "SUBPOP.4nKLpQ"
  networkId: string; // e.g., "BHARAT-POP.3mRVeZ"
  refCode?: string; // Reference Code
  coordinates: {
    lat: number;
    lng: number;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  contactName: string;
  contactNo: string;
  contactEmail?: string;
  customerName?: CustomerType; // New field for customer selection
  iconType?: string; // New field for icon consistency

  // Rental Information
  isRented: boolean;
  rentAmount?: number;
  agreementDates?: {
    start: Date;
    end: Date;
  };
  landlordName?: string;
  landlordContact?: string;
  natureOfBusiness?: string;
  owner?: string;

  // Technical Details
  structureType: "Tower" | "Building" | "Ground" | "Rooftop" | "Other";
  height?: number; // in meters
  upsAvailability: boolean;
  upsCapacity?: string;
  backupCapacity: string; // battery backup hours or KVA
  powerSource: "Grid" | "Solar" | "Hybrid" | "Generator";

  // Equipment Details
  equipmentList?: Array<{
    name: string;
    model: string;
    quantity: number;
    installDate?: Date;
  }>;

  // Connectivity
  connectedTo?: string[]; // IDs of connected POPs
  bandwidth?: string;

  // Metadata
  source: InfrastructureSource;
  kmlFileName?: string; // if from KML
  createdBy?: string;
  createdOn: Date;
  updatedOn: Date;
  status: "Active" | "Inactive" | "Maintenance" | "Planned" | "RFS";
  notes?: string;
}

export interface KMLImportResult {
  success: boolean;
  itemsImported: number;
  errors: string[];
  infrastructures: Infrastructure[];
}

export interface InfrastructureFilters {
  type?: InfrastructureType;
  source?: InfrastructureSource;
  status?: Infrastructure["status"];
  state?: string;
  city?: string;
  searchTerm?: string;
}

