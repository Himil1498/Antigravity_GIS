export interface FooterProps {
  className?: string;
  position?: 'fixed' | 'relative';
  showDetails?: boolean;
}

export interface BackendHealth {
  status: string;
  server: {
    name: string;
    version: string;
    environment: string;
    uptime: number;
  };
  database: {
    status: string;
    name: string;
  };
}

