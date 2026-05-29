const fs = require("fs");
const path = require("path");
const { rawPool } = require("../src/config/database");

async function runMigration() {
  try {
    const sqlPath = path.join(
      __dirname,
      "../src/startup/002_add_permissions.sql",
    );
    console.log(`📖 Reading migration file: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("🔄 Connecting to database...");
    // database.js exports 'pool' which has a query method
    // We can use it directly.

    console.log("🚀 Executing migration...");
    // The query wrapper in database.js handles ? -> $1 but our SQL file uses standard SQL
    // It should be fine as long as we don't use ? placeholders improperly.
    // The wrapper also splits by ; if we used a simple query, but for a large block
    // we might need to be careful. However, pg pool.query supports multiple statements.

    await rawPool.query(sql);

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
