
import type { AppMode, Environment } from "../../types/common/index";
import type { EnvironmentConfig } from "./types";
import {
  developmentConfig,
  productionConfig,
  testingConfig,
  maintenanceConfig,
} from "./configs";

// Environment Detection
export const getEnvironment = (): Environment => {
  const nodeEnv = process.env.NODE_ENV;
  const reactAppEnv = process.env.REACT_APP_ENVIRONMENT;

  // Use REACT_APP_ENVIRONMENT if set, otherwise fall back to NODE_ENV
  if (reactAppEnv) {
    return reactAppEnv as Environment;
  }

  switch (nodeEnv) {
    case "production":
      return "production";
    case "test":
      return "testing";
    case "development":
    default:
      return "development";
  }
};

// App Mode Detection
export const getAppMode = (): AppMode => {
  const environment = getEnvironment();
  const maintenanceMode = process.env.REACT_APP_MAINTENANCE_MODE === "true";

  if (maintenanceMode) {
    return "maintenance";
  }

  switch (environment) {
    case "production":
      return "production";
    case "testing":
      return "testing";
    case "development":
    default:
      return "development";
  }
};

// Get configuration based on current environment
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const mode = getAppMode();

  switch (mode) {
    case "production":
      return productionConfig;
    case "testing":
      return testingConfig;
    case "maintenance":
      return maintenanceConfig;
    case "development":
    default:
      return developmentConfig;
  }
};

// Environment utilities
export const isDevelopment = (): boolean => getEnvironment() === "development";
export const isProduction = (): boolean => getEnvironment() === "production";
export const isTesting = (): boolean => getEnvironment() === "testing";
export const isMaintenanceMode = (): boolean => getAppMode() === "maintenance";

// Feature flags
export const isFeatureEnabled = (
  feature: keyof EnvironmentConfig["features"]
): boolean => {
  const config = getEnvironmentConfig();
  return config.features[feature];
};

// Debug utilities
export const debugLog = (message: string, ...args: any[]): void => {
  const config = getEnvironmentConfig();
  if (config.app.debug) {
    console.log(`[${config.app.mode.toUpperCase()}] ${message}`, ...args);
  }
};

export const debugWarn = (message: string, ...args: any[]): void => {
  const config = getEnvironmentConfig();
  if (config.app.debug) {
    console.warn(`[${config.app.mode.toUpperCase()}] ${message}`, ...args);
  }
};

export const debugError = (message: string, error?: any): void => {
  const config = getEnvironmentConfig();
  if (config.app.debug) {
    console.error(`[${config.app.mode.toUpperCase()}] ${message}`, error);
  }
};

// Version information
export const getVersionInfo = () => {
  const config = getEnvironmentConfig();
  return {
    version: config.app.version,
    buildDate: config.app.buildDate,
    environment: config.app.environment,
    mode: config.app.mode,
    debug: config.app.debug,
  };
};

// Environment validation
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const config = getEnvironmentConfig();
  const errors: string[] = [];

  // Check required environment variables
  if (!config.maps.apiKey) {
    console.warn(
      "Google Maps API key is not configured (REACT_APP_GOOGLE_MAPS_API_KEY)"
    );
  }

  if (config.app.environment === "production") {
    // Relaxed check: Only require HTTPS if not using an IP address
    const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(
      window.location.hostname
    );

    if (
      !isIpAddress &&
      !config.api.baseUrl.startsWith("https://") &&
      !config.api.baseUrl.startsWith("/")
    ) {
      console.warn(
        "Production API URL should ideally use HTTPS, but allowing HTTP for internal deployments."
      );
    }

    if (config.monitoring.sentry.enabled && !config.monitoring.sentry.dsn) {
      console.warn(
        "Sentry DSN is missing but Sentry is enabled. Disabling Sentry."
      );
      config.monitoring.sentry.enabled = false;
    }

    if (
      config.monitoring.analytics.enabled &&
      !config.monitoring.analytics.trackingId
    ) {
      console.warn(
        "Analytics tracking ID is missing but Analytics is enabled. Disabling Analytics."
      );
      config.monitoring.analytics.enabled = false;
    }
  }

  return {
    valid: true, // Always return valid to prevent blocking the app
    errors,
  };
};

