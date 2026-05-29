#!/usr/bin/env node
/**
 * Environment Switcher for OptiConnect GIS Frontend
 *
 * Usage:
 *   node scripts/switch-env.js development   - Switch to development mode
 *   node scripts/switch-env.js production    - Switch to production mode
 */

const fs = require("fs");
const path = require("path");

const env = process.argv[2] || "development";
const validEnvs = ["development", "production"];

if (!validEnvs.includes(env)) {
  console.error(`Invalid environment: ${env}`);
  console.log(`Valid options: ${validEnvs.join(", ")}`);
  process.exit(1);
}

const rootDir = path.join(__dirname, "..");
const sourceFile = path.join(rootDir, `.env.${env}`);
const targetFile = path.join(rootDir, ".env");

if (!fs.existsSync(sourceFile)) {
  console.error(`Environment file not found: .env.${env}`);
  process.exit(1);
}

// Copy the environment file
const content = fs.readFileSync(sourceFile, "utf8");
fs.writeFileSync(targetFile, content);

console.log("");
console.log("=====================================================");
console.log(`  OptiConnect GIS - Environment Switched`);
console.log("=====================================================");
console.log(`  Mode: ${env.toUpperCase()}`);
console.log(`  Source: .env.${env}`);
console.log(`  Target: .env`);
console.log("=====================================================");

if (env === "development") {
  console.log("  API URL: http://localhost:82/api");
  console.log("  Frontend: http://localhost:3005");
  console.log("");
  console.log("  To start development:");
  console.log("    1. Start Backend: cd ../Backend && npm run dev");
  console.log("    2. Start Frontend: npm start");
} else {
  console.log("  API URL: http://172.16.20.11:82/api");
  console.log("  Frontend: http://172.16.20.11:81");
  console.log("");
  console.log("  To build for production:");
  console.log("    npm run build");
  console.log("");
  console.log("  Then deploy the build/ folder to your production server.");
}
console.log("=====================================================");
console.log("");
