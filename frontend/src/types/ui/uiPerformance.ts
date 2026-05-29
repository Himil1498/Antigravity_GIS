
// Performance Monitoring
export interface PerformanceState {
  monitoring: boolean;
  showFPS: boolean;
  showMemory: boolean;
  showNetwork: boolean;
  metrics: PerformanceMetrics;
  alerts: PerformanceAlert[];
}

export interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    latency: number;
    bandwidth: number;
    requests: number;
  };
  rendering: {
    componentsCount: number;
    rerenders: number;
    renderTime: number;
  };
  interactions: {
    responseTime: number;
    inputDelay: number;
    scrollPerformance: number;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'fps' | 'memory' | 'network' | 'rendering';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  acknowledged: boolean;
}

