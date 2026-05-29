const { pool } = require("../src/config/database");

async function fixAuditLogsSchema() {
  const client = await pool.getConnection(); // Use getConnection wrapper
  try {
    console.log("🔗 Connected to database...");

    console.log("🛠️ Altering audit_logs.resource_id to VARCHAR(255)...");

    // Check current type first (optional, but good for logs)
    // Here we just force the alteration
    await client.query(`
      ALTER TABLE audit_logs 
      ALTER COLUMN resource_id TYPE VARCHAR(255);
    `);

    console.log(
      '✅ Column "resource_id" changed to VARCHAR(255) successfully!',
    );
  } catch (err) {
    console.error("❌ Error fixing schema:", err);
  } finally {
    client.release();
    process.exit();
  }
}

fixAuditLogsSchema();
