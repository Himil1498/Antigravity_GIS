
import type { AppMode, Environment } from "../../types/common/index";

export interface EnvironmentConfig {
  app: {
    name: string;
    version: string;
    mode: AppMode;
    environment: Environment;
    debug: boolean;
    buildDate: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
    enableMocking: boolean;
  };
  maps: {
    apiKey: string;
    libraries: string[];
    region: string;
    language: string;
  };
  features: {
    analytics: boolean;
    export: boolean;
    import: boolean;
    realTimeUpdates: boolean;
    debugging: boolean;
  };
  monitoring: {
    sentry: {
      enabled: boolean;
      dsn?: string;
    };
    analytics: {
      enabled: boolean;
      trackingId?: string;
    };
    performance: {
      enabled: boolean;
      sampleRate: number;
    };
  };
  storage: {
    prefix: string;
    enableEncryption: boolean;
    ttl: number;
  };
  ui: {
    theme: "light" | "dark" | "auto";
    showModeIndicator: boolean;
    enableAnimations: boolean;
    enableTooltips: boolean;
  };
}

