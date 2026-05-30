const { errorHandler, notFound } = require("../shared/middleware/errorHandler");

/**
 * Configure API Routes
 */
const configureRoutes = (app) => {
  // Health Check endpoint (defined before routes array)
  app.get("/api/health", async (req, res) => {
    try {
      const { pool } = require("../config/database");

      // Check database connection (PostgreSQL syntax)
      let dbStatus = "disconnected";
      let dbName = "unknown";
      try {
        const [rows] = await pool.query("SELECT current_database() as db");
        dbStatus = "connected";
        dbName = rows[0]?.db || "opticonnect_gis_db";
      } catch (error) {
        console.error("Database health check failed:", error);
      }

      res.json({
        success: true,
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "OptiConnect GIS Backend",
        server: {
          version: "1.0.0",
          environment: process.env.NODE_ENV || "development",
        },
        database: {
          status: dbStatus,
          name: dbName,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: "error",
        message: "Health check failed",
      });
    }
  });

  // Import and use routes - with individual error handling
  const routes = [
    // Public routes (no auth) - Load these first
    { name: "auth", path: "../modules/auth/auth.routes", mount: "/api/auth" },

    {
      name: "passwordResetRequests",
      path: "../modules/auth/password.routes",
      mount: "/api/password-reset-requests",
    },

    // Authenticated routes
    { name: "mfa", path: "../modules/auth/mfa.routes", mount: "/api/mfa" },
    { name: "users", path: "../modules/user/user.routes", mount: "/api/users" },
    // Network Planning / Infrastructure Files - Mounted here to ensure precedence
    {
      name: "networkPlanning",
      path: "../modules/network-planning/network-planning.routes",
      mount: "/api/network-planning",
    },
    {
      name: "boundaryImpact",
      path: "../modules/boundary-impact/boundary-impact.routes",
      mount: "/api/regions",
    },
    {
      name: "boundaryVersions",
      path: "../modules/boundary-version/boundary-version.routes",
      mount: "/api/regions",
    },
    {
      name: "regions",
      path: "../modules/region/region.routes",
      mount: "/api/regions",
    },
    {
      name: "boundaryPublic",
      path: "../modules/boundary-public/boundary-public.routes",
      mount: "/api/boundaries",
    },
    {
      name: "features",
      path: "../modules/feature/feature.routes",
      mount: "/api/features",
    },
    {
      name: "locationMarker",
      path: "../modules/location-marker/location-marker.routes",
      mount: "/api/location-markers",
    },
    {
      name: "buildingCache",
      path: "../modules/building-cache/building-cache.routes",
      mount: "/api/building-cache",
    },

    {
      name: "layers",
      path: "../modules/layer-management/layer-management.routes",
      mount: "/api/layers",
    },
    // Bookmarks (duplicate removed)
    {
      name: "search",
      path: "../modules/search/search.routes",
      mount: "/api/search",
    },
    {
      name: "sectorRF",
      path: "../modules/sector-rf/sector-rf.routes",
      mount: "/api/rf/sectors",
    },
    {
      name: "analytics",
      path: "../modules/analytics/analytics.routes",
      mount: "/api/analytics",
    },
    {
      name: "audit",
      path: "../modules/audit/audit.routes",
      mount: "/api/audit",
    },
    {
      name: "accessControl",
      path: "../modules/access-control/access.routes",
      mount: "/api", // This routes file contains /temporary-access, /permissions, etc. so we mount at root /api
    },

    {
      name: "bookmarks",
      path: "../modules/bookmark/bookmark.routes",
      mount: "/api/bookmarks",
    },
    {
      name: "preferences",
      path: "../modules/preferences/preferences.routes",
      mount: "/api/preferences",
    },
    // Temporary Access (handled by access-control)
    {
      name: "regionRequests",
      path: "../modules/region-request/region-request.routes",
      mount: "/api/region-requests",
    },
    // Permissions (handled by access-control)
    {
      name: "reports",
      path: "../modules/reports/reports.routes",
      mount: "/api/reports",
    },
    // User Map Preferences (consolidated into preferences)
    // Search history is now part of search module
    // {
    //   name: "searchHistory",
    //   path: "../routes/searchHistory.routes",
    //   mount: "/api/search-history",
    // },
    {
      name: "databaseBackup",
      path: "../modules/database-backup/database-backup.routes",
      mount: "/api/admin/backup",
    },
    {
      name: "notifications",
      path: "../modules/notification/notification.routes",
      mount: "/api/notifications",
    },
    {
      name: "updates",
      path: "../modules/system-updates/updates.routes",
      mount: "/api/updates",
    },
    {
      name: "tools",
      path: "../modules/tools/tools.routes",
      mount: "/api/tools",
    },

    {
      name: "security",
      path: "../modules/security/security.routes",
      mount: "/api/developer-tools/security",
    },
    {
      name: "environment",
      path: "../modules/environment/environment.routes",
      mount: "/api/developer-tools/environment",
    },

    // Routes mounted at /api - Load these LAST to avoid intercepting specific routes
    // Group/User Permissions (handled by access-control/groups)

    {
      name: "system",
      path: "../modules/system/system.routes",
      mount: "/api/system",
    },

    {
      name: "darkFiber",
      path: "../modules/dark-fiber/routes/darkFiberRoutes",
      mount: "/api/dark-fiber",
    },
    {
      name: "darkFiberFolders",
      path: "../modules/dark-fiber/routes/darkFiberFolderRoutes",
      mount: "/api/dark-fiber-folders",
    },

    { name: "batch", path: "../modules/batch/batch.routes", mount: "/api" }, // NEW: Batch request endpoint
    
    // Admin Module (Exports, etc.)
    {
      name: "admin",
      path: "../modules/admin/admin.routes",
      mount: "/api/admin",
    },
  ];

  let loadedCount = 0;
  let failedRoutes = [];

  routes.forEach(({ name, path, mount }) => {
    try {
      const routeModule = require(path);
      app.use(mount, routeModule);
      console.log(`✅ Loaded route group: ${name} at ${mount}`);
      loadedCount++;
    } catch (error) {
      console.error(
        `❌ Failed to load ${name} routes (${mount}):`,
        error.message,
      );
      failedRoutes.push({ name, mount, error: error.message });
    }
  });

  if (failedRoutes.length === 0) {
    console.log(`✅ All ${loadedCount} routes loaded successfully`);
  } else {
    console.warn(
      `⚠️ ${loadedCount}/${routes.length} routes loaded. ${failedRoutes.length} failed:`,
    );
    failedRoutes.forEach(({ name, mount, error }) => {
      console.warn(`   - ${name} (${mount}): ${error}`);
    });
  }

  // 404 handler
  app.use(notFound);

  // Error handler middleware (must be last)
  app.use(errorHandler);
};

module.exports = { configureRoutes };
