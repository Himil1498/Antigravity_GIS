type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
  }

  debug(message: string, ...args: any[]) {
    if (!this.isProduction) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    // In production, we might want to log important info, or suppress it.
    // User requested "strip prod logs", but usually info/warn/error are kept or sent to service.
    // For now, mirroring console.log behavior (suppressed in prod by index.tsx override, but here we control it explicitly).
    if (!this.isProduction) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }
}

export const logger = new Logger();

