
import { getEnvironmentConfig } from "./helpers";

export * from "./types";
export * from "./configs";
export * from "./helpers";

// Export the current configuration
export const config = getEnvironmentConfig();

