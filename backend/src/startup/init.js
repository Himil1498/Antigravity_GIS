const { testConnection } = require("../config/database");
const { ensureTables } = require("../config/initTables");
const { startCleanupScheduler } = require("../shared/utils/temporaryAccessCleanup");
const websocketServer = require("../shared/services/websocket/index");
const checkVersionAndNotify = require("./versionCheck");

/**
 * Initialize and start the server
 */
const startServer = async (app, server, port, env) => {
  try {
    // Test database connection first
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error(
        "Failed to connect to database. Please check your configuration."
      );
      process.exit(1);
    }

    // Ensure all database tables exist
    await ensureTables();

    // Start temporary access cleanup scheduler
    startCleanupScheduler();

    // Check for automated system updates
    await checkVersionAndNotify();

    // Initialize WebSocket server
    websocketServer.initialize(server);

    // Get local IP address for network access
    const os = require("os");
    const networkInterfaces = os.networkInterfaces();
    let localIP = null;

    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      for (const iface of interfaces) {
        // Skip internal (loopback) and non-IPv4 addresses
        if (iface.family === "IPv4" && !iface.internal) {
          localIP = iface.address;
          break;
        }
      }
      if (localIP) break;
    }

    // Start HTTP server (Express + WebSocket)
    const HOST = process.env.HOST || "0.0.0.0";
    server.listen(port, HOST, () => {
      console.log("\n" + "=".repeat(60));
      console.log("🚀 OptiConnect GIS Backend Server Started Successfully!");
      console.log("=".repeat(60));
      console.log(`📡 HTTP Server: http://localhost:${port}`);
      console.log(`🔌 WebSocket Server: ws://localhost:${port}/ws`);
      console.log(`🌍 Environment: ${env}`);
      console.log(
        `📊 Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}`
      );
      console.log(`🔒 CORS Enabled: ${process.env.FRONTEND_URL}`);
      console.log("=".repeat(60));
      console.log("  Access URLs:");
      console.log("=".repeat(60));
      console.log(`  Local (this computer):   http://localhost:${port}`);
      if (localIP) {
        console.log(`  Network (other devices): http://${localIP}:${port}`);
        console.log("");
        console.log("  📱 TO ACCESS FROM ANOTHER LAPTOP:");
        console.log(`     1. Connect laptop to same Wi-Fi/network`);
        console.log(
          `     2. Open browser and go to: http://${localIP}:${port}`
        );
        console.log(
          `     3. Frontend should use: http://${localIP}:${port}/api`
        );
        console.log(`     4. WebSocket should use: ws://${localIP}:${port}/ws`);
      }
      console.log("=".repeat(60));
      console.log("📚 API Documentation: http://localhost:" + port + "/");
      console.log("💚 Health Check: http://localhost:" + port + "/api/health");
      console.log("=".repeat(60) + "\n");
      console.log("🔥 Server is ready to accept requests!\n");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

module.exports = { startServer };
