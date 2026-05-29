/**
 * Performance Monitoring Middleware
 * Tracks request duration and resource usage
 */

const { performance } = require('perf_hooks');

const performanceMiddleware = (req, res, next) => {
  const start = performance.now();
  const startMem = process.memoryUsage().heapUsed;

  // Capture original end function
  const originalEnd = res.end;

  // Override end function to calculate metrics
  res.end = function (...args) {
    const duration = performance.now() - start;
    const endMem = process.memoryUsage().heapUsed;
    const memDiff = endMem - startMem;

    // Log performance metrics for slow requests (> 1000ms) or high memory usage
    if (duration > 1000) {
      console.warn(`⚠️ Slow Request: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
    }

    // Add metrics headers only if headers haven't been sent yet
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
      res.setHeader('X-Memory-Used', `${(memDiff / 1024 / 1024).toFixed(2)}MB`);
    }

    originalEnd.apply(res, args);
  };

  next();
};

module.exports = performanceMiddleware;
