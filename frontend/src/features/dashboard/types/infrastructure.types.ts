export interface InfrastructureStats {
  total: number;
  byItemType: {
    POP: number;
    "Sub POP": number;
    "BTS-CO-LO": number;
    "Bandwidth BTS": number;
    "Office Location": number;
    NNI: number;
    "Data Center": number;
    Customer: number;
  };
  byCustomer: {
    "Reliance Jio Infocomm Limited": number;
    "Vodafone Idea Limited": number;
    "SIFY Technologies Limited": number;
    "Tata Communications Limited": number;
    "Bharti Airtel Limited": number;
  };
  byStatus: {
    Active: number;
    Inactive: number;
    Maintenance: number;
    Planned: number;
    RFS: number;
    Damaged: number;
  };
}

export interface KPICardData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "stable";
    value: number;
    label: string;
  };
  color: string;
  bgColor: string;
  rawColorHex?: string; // New optional property for dynamic RGB colors
  breakdown?: { label: string; count: number }[];
}

export const CUSTOMER_SHORT_NAMES: Record<string, string> = {
  "Reliance Jio Infocomm Limited": "Jio",
  "Vodafone Idea Limited": "Vodafone",
  "SIFY Technologies Limited": "Sify",
  "Tata Communications Limited": "Tata",
  "Bharti Airtel Limited": "Airtel",
};

export const EMPTY_STATS: InfrastructureStats = {
  total: 0,
  byItemType: {
    POP: 0,
    "Sub POP": 0,
    "BTS-CO-LO": 0,
    "Bandwidth BTS": 0,
    "Office Location": 0,
    NNI: 0,
    "Data Center": 0,
    Customer: 0,
  },
  byCustomer: {
    "Reliance Jio Infocomm Limited": 0,
    "Vodafone Idea Limited": 0,
    "SIFY Technologies Limited": 0,
    "Tata Communications Limited": 0,
    "Bharti Airtel Limited": 0,
  },
  byStatus: {
    Active: 0,
    Inactive: 0,
    Maintenance: 0,
    Planned: 0,
    RFS: 0,
    Damaged: 0,
  },
};

