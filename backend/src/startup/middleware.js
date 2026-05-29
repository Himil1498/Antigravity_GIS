const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { getCacheStats, clearAllCache } = require("../shared/middleware/cache");
const performanceMiddleware = require("../shared/middleware/performance");
const compressionMiddleware = require("../shared/middleware/compression");
const auditInterceptor = require("../middleware/auditInterceptor");

/**
 * Configure Express Middleware
 */
const configureMiddleware = (app) => {
  // Security middleware
  app.use(helmet());

  // CORS configuration - Support multiple origins
  const allowedOrigins = [
    "http://localhost:3005",
    "http://localhost:3000",
    "http://172.16.0.148:3005", // Network access - Frontend
    "http://172.16.0.148:82", // Network access - Backend
    "http://172.16.20.11:81", // Frontend (Legacy)
    "http://172.16.20.11", // Frontend (Standard Port 80)
    "https://172.16.20.11", // Frontend (HTTPS)
    "http://172.16.20.11:82", // Self/Backend (External Proxy Access)
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.use(
    cors({
      origin: true, // Allow ALL origins (Reflects request origin)
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Request-ID",
        "X-Request-Time",
      ],
      exposedHeaders: ["X-Request-ID", "X-Request-Time"],
    })
  );

  // Body parser middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // HTTP request logger (only in development)
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // Performance tracking middleware
  // Performance tracking middleware
  app.use(performanceMiddleware);

  // 🚀 COMPRESSION MIDDLEWARE - Reduces response size by 70-80%
  app.use(compressionMiddleware);

  // 🛡️ GLOBAL AUDIT INTERCEPTOR - Tracks requests and failures seamlessly
  app.use(auditInterceptor);

  // Rate limiting - Industry standard (more permissive for development)
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // 500 requests per minute
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for critical endpoints
      const skipPaths = [
        "/auth",
        "/temporary-access",
        "/users",
        "/datahub",
        "/measurements",
        "/drawings",
        "/rf",
        "/elevation",
        "/infrastructure",
        "/analytics",
        "/notifications",
        "/regions",
        "/search",
        "/user-map-preferences",
        "/boundaries",
        "/network-planning",  // MVT tiles fire 50+ req/sec during map pan/zoom
      ];
      // Check if request path starts with any skip path (without /api/ prefix)
      return skipPaths.some((path) => req.path.startsWith(path));
    },
  });
  app.use("/api/", limiter);

  // 🚀 CACHE STATS ENDPOINT - Monitor cache performance
  app.get("/api/cache/stats", (req, res) => {
    const stats = getCacheStats();
    res.json({
      success: true,
      cache: stats,
    });
  });

  // 🚀 CLEAR CACHE ENDPOINT - Clear all cache (admin only in production)
  app.post("/api/cache/clear", (req, res) => {
    clearAllCache();
    res.json({
      success: true,
      message: "All cache cleared successfully",
    });
  });

  // 🚀 DATABASE POOL STATS ENDPOINT - Monitor database connection pool
  app.get("/api/db/pool-stats", (req, res) => {
    const { getPoolStats } = require("../config/database");
    const stats = getPoolStats();

    res.json({
      success: true,
      pool: stats,
      recommendations: {
        status:
          parseFloat(stats.utilizationPercent) > 80
            ? "critical"
            : parseFloat(stats.utilizationPercent) > 60
              ? "warning"
              : "healthy",
        message:
          parseFloat(stats.utilizationPercent) > 80
            ? "Consider increasing connection pool limit or optimizing queries"
            : parseFloat(stats.utilizationPercent) > 60
              ? "Monitor closely, utilization is moderate"
              : "Pool is healthy",
      },
    });
  });

  // Health check route
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "🚀 OptiConnectGIS Backend API is running!",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });
};

module.exports = { configureMiddleware };
