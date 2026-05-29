require("dotenv").config({ path: "../.env" });
const { pool } = require("../src/config/database");

const migrate = async () => {
  const client = await pool.getConnection(); // Use wrapped connection
  try {
    console.log("🔄 Starting migration: Add category to network_folders...");

    await client.query("BEGIN");

    // 1. Add Column
    console.log('📝 Adding "category" column...');
    await client.query(`
      ALTER TABLE network_folders 
      ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'customer'
    `);

    // 2. Backfill Data based on keywords
    console.log("🚚 Backfilling data...");

    const INFRA_KEYWORDS = [
      "INFRA",
      "FIBER",
      "TOWER",
      "ROUTE",
      "ODF",
      "SPLITTER",
      "POP",
      "BTS",
      "NNI",
      "DATA CENTER",
    ];

    // Construct a case-insensitive WHERE clause
    const whereConditions = INFRA_KEYWORDS.map(
      (k) => `name ILIKE '%${k}%'`,
    ).join(" OR ");

    // Update Infrastructure
    const infraUpdate = `
      UPDATE network_folders 
      SET category = 'infrastructure'
      WHERE (${whereConditions}) OR is_system = true AND name ILIKE '%Infrastructure%'
    `;

    // Additional System check: If a system folder contains "Customer", explicit set to customer (default is customer, but good to be safe)
    const customerUpdate = `
      UPDATE network_folders
      SET category = 'customer'
      WHERE name ILIKE '%Customer%'
    `;

    const [resInfra] = await client.query(infraUpdate);
    console.log(
      `✅ Updated ${resInfra.rowCount || 0} folders to 'infrastructure'`,
    );

    const [resCust] = await client.query(customerUpdate);
    console.log(`✅ Updated ${resCust.rowCount || 0} folders to 'customer'`);

    await client.query("COMMIT");
    console.log("🎉 Migration completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
};

migrate();
