import type { EnvironmentConfig } from "./types";

// Default configurations for each environment
export const developmentConfig: EnvironmentConfig = {
  app: {
    name: "Opti Connect GIS Platform",
    version: process.env.REACT_APP_VERSION || "1.0.0-dev",
    mode: "development",
    environment: "development",
    debug: true,
    buildDate: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
  },
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:82/api",
    timeout: 10000,
    retries: 3,
    enableMocking: false,
  },
  maps: {
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places", "drawing", "geometry", "visualization"],
    region: "IN",
    language: "en",
  },
  features: {
    analytics: true,
    export: true,
    import: true,
    realTimeUpdates: true,
    debugging: true,
  },
  monitoring: {
    sentry: {
      enabled: false,
    },
    analytics: {
      enabled: false,
    },
    performance: {
      enabled: true,
      sampleRate: 1.0,
    },
  },
  storage: {
    prefix: "opti_connect_dev_",
    enableEncryption: false,
    ttl: 24 * 60 * 60 * 1000, // 24 hours
  },
  ui: {
    theme: "auto",
    showModeIndicator: true,
    enableAnimations: true,
    enableTooltips: true,
  },
};

export const productionConfig: EnvironmentConfig = {
  app: {
    name: "Opti Connect GIS Platform",
    version: process.env.REACT_APP_VERSION || "1.0.0",
    mode: "production",
    environment: "production",
    debug: false,
    buildDate: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
  },
  api: {
    // Use the configured URL or default to the IP address you provided
    baseUrl: process.env.REACT_APP_API_BASE_URL || "http://172.16.20.11:82/api",
    timeout: 30000,
    retries: 3,
    enableMocking: false,
  },
  maps: {
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places", "drawing", "geometry", "visualization"],
    region: "IN",
    language: "en",
  },
  features: {
    analytics: true,
    export: true,
    import: true,
    realTimeUpdates: true,
    debugging: false,
  },
  monitoring: {
    sentry: {
      enabled: true,
      dsn: process.env.REACT_APP_SENTRY_DSN,
    },
    analytics: {
      enabled: true,
      trackingId: process.env.REACT_APP_GA_TRACKING_ID,
    },
    performance: {
      enabled: true,
      sampleRate: 0.1,
    },
  },
  storage: {
    prefix: "opti_connect_",
    enableEncryption: true,
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  ui: {
    theme: "auto",
    showModeIndicator: false,
    enableAnimations: true,
    enableTooltips: true,
  },
};

export const testingConfig: EnvironmentConfig = {
  ...developmentConfig,
  app: {
    ...developmentConfig.app,
    mode: "testing",
    environment: "testing",
  },
  api: {
    ...developmentConfig.api,
    baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:82/api",
    enableMocking: false,
  },
  features: {
    ...developmentConfig.features,
    debugging: false,
  },
  storage: {
    ...developmentConfig.storage,
    prefix: "opti_connect_test_",
  },
};

export const maintenanceConfig: EnvironmentConfig = {
  ...productionConfig,
  app: {
    ...productionConfig.app,
    mode: "maintenance",
  },
  features: {
    analytics: false,
    export: false,
    import: false,
    realTimeUpdates: false,
    debugging: false,
  },
  ui: {
    ...productionConfig.ui,
    showModeIndicator: true,
  },
};

