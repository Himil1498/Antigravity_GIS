const fs = require("fs");
const path = require("path");

const mode = process.argv[2] || "development";
const validModes = ["development", "production"];

if (!validModes.includes(mode)) {
  console.error(`Invalid mode: ${mode}`);
  console.error(`Usage: node check-mode.js [development|production]`);
  process.exit(1);
}

// Load environment variables manually
const envPath = path.resolve(__dirname, "../.env");

if (!fs.existsSync(envPath)) {
  console.error(
    "\x1b[31m%s\x1b[0m",
    "Error: .env file not found at " + envPath,
  );
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};

envContent.split("\n").forEach((line) => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith("#")) {
    const parts = trimmedLine.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim();
      envVars[key] = value;
    }
  }
});

const errors = [];

function check(key, expectedValue) {
  const value = envVars[key];
  if (!value) {
    errors.push(`Missing variable: ${key}`);
    return;
  }

  if (value !== expectedValue) {
    errors.push(`Invalid ${key}: ${value} (Expected: ${expectedValue})`);
  }
}

function checkNotLocalhost(key) {
  const value = envVars[key];
  if (!value) {
    errors.push(`Missing variable: ${key}`);
    return;
  }
  if (value.includes("localhost") || value.includes("127.0.0.1")) {
    errors.push(
      `Invalid ${key}: ${value} (Should NOT be localhost in production)`,
    );
  }
}

function checkContains(key, subnet) {
  const value = envVars[key];
  if (!value) {
    errors.push(`Missing variable: ${key}`);
    return;
  }
  if (!value.includes(subnet)) {
    errors.push(`Invalid ${key}: ${value} (Expected to include ${subnet})`);
  }
}

console.log(`Checking compatibility for mode: \x1b[36m${mode}\x1b[0m`);

if (mode === "development") {
  // Check either NODE_ENV or REACT_APP_ENV
  if (
    envVars["NODE_ENV"] !== "development" &&
    envVars["REACT_APP_ENV"] !== "development"
  ) {
    errors.push("Neither NODE_ENV nor REACT_APP_ENV is set to development");
  }

  checkContains("REACT_APP_API_URL", "localhost");
} else if (mode === "production") {
  if (
    envVars["NODE_ENV"] !== "production" &&
    envVars["REACT_APP_ENV"] !== "production"
  ) {
    errors.push("Neither NODE_ENV nor REACT_APP_ENV is set to production");
  }

  checkNotLocalhost("REACT_APP_API_URL");
  checkContains("REACT_APP_API_URL", "172.16.");

  check("REACT_APP_ENABLE_DEBUG_MODE", "false");
}

// Check web.config
const webConfigPath = path.resolve(__dirname, "../web.config");
if (fs.existsSync(webConfigPath)) {
  const webConfigContent = fs.readFileSync(webConfigPath, "utf8");
  if (mode === "development") {
    if (webConfigContent.includes("172.16.20.11")) {
      console.log(
        "\x1b[33m%s\x1b[0m",
        "⚠ WARNING: web.config is configured for PRODUCTION (contains 172.16.20.11).",
      );
      console.log(
        "\x1b[33m%s\x1b[0m",
        '  This is fine for "npm start", but will fail if deployed to IIS locally.',
      );
    }
  }
}

if (errors.length > 0) {
  console.error("\x1b[31m%s\x1b[0m", "❌ Compatibility Check Failed:");
  errors.forEach((err) => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log("\x1b[32m%s\x1b[0m", "✔ Compatibility Check Passed");
  process.exit(0);
}
