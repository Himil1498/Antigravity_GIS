export interface RecentActivity {
  id: string;
  user: string;
  userRole: string;
  action: string;
  details: string;
  region: string;
  timestamp: string;
  type: string;
}

export interface SystemOverviewData {
  networkHealth: number;
  coverage: number;
  utilization: number;
  details: {
    totalInfrastructure: number;
    activeInfrastructure: number;
    inactiveInfrastructure: number;
    totalRegions: number;
    coveredRegions: number;
    maintenanceDue: number;
  };
}

