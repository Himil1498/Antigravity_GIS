const express = require("express");
const http = require("http");
// Server restart trigger
// Server restart trigger - Added by AI 16
const { env } = require("./src/config/environment");

// Import startup modules
// Add global BigInt serialization fix to support Prisma BigInt results (like COUNT/SUM)
BigInt.prototype.toJSON = function () {
  return Number(this);
};

const { configureMiddleware } = require("./src/startup/middleware");
const { configureRoutes } = require("./src/startup/routes");
const { startServer } = require("./src/startup/init");
const websocketServer = require("./src/shared/services/websocket/index");

// --- Production Log Optimization ---
if (process.env.NODE_ENV === "production") {
  console.log = function () {};
  console.debug = function () {};
  // Keeping console.error and console.warn for critical issues
}

// Initialize Express app
const app = express();
app.set("trust proxy", 1); // Trust only the 1st reverse proxy (Nginx) to prevent IP spoofing

// Create HTTP server
const server = http.createServer(app);

// 1. Configure Middleware (Security, CORS, Parsing, Logging, RateLimit)
configureMiddleware(app);

// 2. Configure Routes (API endpoints, Error Handling)
configureRoutes(app);

// Server configuration
const PORT = process.env.PORT || 3000;

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

// 3. Start Server (Database connection, Tables, WebSocket, HTTP)
startServer(app, server, PORT, env);

module.exports = { app, server, websocketServer };
