
import { DashboardMetrics } from '../../types/dashboard/index';

export const generateMockMetrics = (): DashboardMetrics => {
  return {
    activeUsers: 98,
    inactiveUsers: 27,
    currentlyLoggedIn: [],
    toolUsage: {
      'distance-measurement': 145,
      'polygon-drawing': 89,
      'circle-drawing': 67,
      'elevation-profile': 54,
      'infrastructure-management': 112
    },
    regionalActivity: {
      'Delhi': 85,
      'Mumbai': 72,
      'Bangalore': 68,
      'Chennai': 45,
      'Kolkata': 38
    },
    systemHealth: {
      cpu: 45,
      memory: 62,
      latency: 87,
      uptime: 45234,
      errorRate: 2,
      apiStatus: 'healthy'
    },
    lastUpdated: new Date()
  };
};


