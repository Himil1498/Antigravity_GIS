import {
  Region,
  Boundary,
  BoundaryVersion,
  ImpactAnalysis,
} from "../../../../services/region/index";

export interface InfrastructureStats {
  total: number;
  POP: number;
  "Sub POP": number;
  "BTS-CO-LO": number;
  "Bandwidth BTS": number;
  "Office Location": number;
  NNI: number;
  "Data Center": number;
  Customer: number;
}

export type { Region, Boundary, BoundaryVersion, ImpactAnalysis };

