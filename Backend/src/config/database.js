const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma");

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432, // Default PG port
  max: parseInt(process.env.DB_CONNECTION_LIMIT) || 50, // Increased for concurrent processing
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Initialize Prisma Client with Driver Adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

// Note: dotenv is loaded by src/config/environment.js (via server.js) before this module.
// Do NOT call require("dotenv").config() here — it loads the default .env
// and may override the correct .env.production variables.

// Pool Monitoring
pool.on("error", (err, client) => {
  console.error("❌ Unexpected error on idle client", err);
});

pool.on("acquire", () => {
  // Optional: Log low pool health
  if (pool.idleCount < 5 && pool.totalCount > 40) {
    console.warn("⚠️ Connection Pool Running Low:", {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    });
  }
});

// Helper to convert MySQL '?' placeholders to PostgreSQL '$n'
const convertQuery = (sql) => {
  let i = 1;
  // 1. Replace MySQL backticks with PostgreSQL double quotes for identifiers
  const quoteFixed = sql.replace(/`/g, '"');
  // 2. Replace ? with $1, $2, etc.
  return quoteFixed.replace(/\?/g, () => `$${i++}`);
};

// Compatibility wrapper to mimic mysql2/promise which returns [rows, fields]
const queryWrapper = async (text, params) => {
  try {
    const formattedSql = convertQuery(text);
    const start = Date.now();
    const res = await pool.query(formattedSql, params);
    const duration = Date.now() - start;

    // Log slow queries (optional)
    if (duration > 500) {
      console.warn("⚠️ Slow Query:", { text, duration, rows: res.rowCount });
    }

    // Compatibility Layer: Polyfill MySQL-style result properties
    const rows = res.rows;

    // 1. Map rowCount to affectedRows
    rows.affectedRows = res.rowCount;

    // 2. Map insertId if RETURNING id was used
    if (res.command === "INSERT" && rows.length > 0 && rows[0].id) {
      rows.insertId = rows[0].id;
    }

    return [rows, res.fields]; // Mimic [rows, fields]
  } catch (err) {
    console.error("❌ Database Query Error:", err.message);
    throw err;
  }
};

// Test connection function
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL Database Connected Successfully!");

    const res = await client.query("SELECT NOW() as now");
    console.log("🕐 Server Time:", res.rows[0].now);

    client.release();
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL Connection Failed:", error.message);
    return false;
  }
};

// Execute query helper (for other modules using executeQuery directly)
const executeQuery = async (query, params = []) => {
  // Re-use wrapper logic but return just rows or whatever the original expected
  // The original executeQuery returned 'results' (which was rows)
  const [rows] = await queryWrapper(query, params);
  return rows;
};

// Pool statistics helper
const getPoolStats = () => {
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount,
  };
};

module.exports = {
  pool: {
    query: queryWrapper,
    execute: queryWrapper, // Alias execute to query for compatibility
    connect: pool.connect.bind(pool), // Expose raw PG connect for PostgreSQL native code
    getConnection: async () => {
      // PG pool.connect() returns a client.
      // MySQL pool.getConnection() returns a connection to release.
      const client = await pool.connect();

      // Wrap the client to behave like mysql2 connection
      const originalQuery = client.query.bind(client);
      const originalRelease = client.release.bind(client);

      // Override query to handle ? -> $n and return [rows, fields]
      client.query = async (text, params) => {
        try {
          const formattedSql =
            typeof text === "string" ? convertQuery(text) : text;
          const res = await originalQuery(formattedSql, params);
          return [res.rows, res.fields];
        } catch (err) {
          console.error(
            "❌ Database Query Error (Wrapped Connection):",
            err.message,
          );
          throw err;
        }
      };

      // Override execute to alias to query
      client.execute = client.query;

      // Add transaction methods mimicking mysql2
      client.beginTransaction = async () => {
        await client.query("BEGIN");
      };

      client.commit = async () => {
        await client.query("COMMIT");
      };

      client.rollback = async () => {
        await client.query("ROLLBACK");
      };

      // Ensure release restores original methods to prevent wrapper nesting (memory leak / stack overflow)
      client.release = () => {
        client.query = originalQuery;
        client.execute = undefined; // Remove alias
        client.beginTransaction = undefined;
        client.commit = undefined;
        client.rollback = undefined;
        client.release = originalRelease;
        return originalRelease();
      };

      return client;
    },
    ...pool, // Expose other pool methods
  },
  testConnection,
  executeQuery,
  getPoolStats,
  rawPool: pool, // Expose raw PG pool for optimized services
  prisma, // Export Prisma client for migrated modules
};
