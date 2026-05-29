/**
 * Performance Monitoring Utility
 * Helper functions to measure execution time and performance metrics
 */

export const performanceMonitor = {
  /**
   * Measure execution time of a function
   * @param name Name of the operation
   * @param setFn Function to execute
   */
  measureExecutionTime: async <T>(name: string, fn: () => Promise<T> | T): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      const duration = end - start;
      
      if (duration > 100) {
        console.warn(`⚠️ Slow Operation [${name}]: ${duration.toFixed(2)}ms`);
      } else {
        // console.debug(`⚡ Operation [${name}]: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`❌ Operation Failed [${name}]: ${(end - start).toFixed(2)}ms`, error);
      throw error;
    }
  },

  /**
   * Log a simple metric
   */
  logMetric: (name: string, value: number, unit: string = 'ms') => {
    console.log(`📊 Metric [${name}]: ${value.toFixed(2)}${unit}`);
  }
};

export default performanceMonitor;

