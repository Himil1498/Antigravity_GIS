const { Pool } = require("pg");
require("dotenv").config({ path: "../Backend/.env" });

async function verifySchema() {
  const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "opticonnect_gis_db",
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log("🔍 Checking audit_logs table...");
    // Postgres query to get columns
    const auditCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'audit_logs'
    `);
    console.log("\n✅ audit_logs columns:");
    auditCols.rows.forEach((col) =>
      console.log(`   - ${col.column_name} (${col.data_type})`),
    );

    console.log("\n🔍 Checking infrastructure tables...");
    const infraTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%infra%' 
      AND table_schema = 'public'
    `);
    console.log("\n✅ Infrastructure-related tables:");
    infraTables.rows.forEach((table) =>
      console.log(`   - ${table.table_name}`),
    );

    if (infraTables.rows.length > 0) {
      const tableName = infraTables.rows[0].table_name;
      const infraCols = await pool.query(
        `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `,
        [tableName],
      );

      console.log(`\n✅ ${tableName} columns:`);
      infraCols.rows.forEach((col) =>
        console.log(`   - ${col.column_name} (${col.data_type})`),
      );
    }

    console.log("\n✅ Schema verification complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

verifySchema();
