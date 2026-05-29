const fs = require("fs");
const path = require("path");
// Adjust path to database config if necessary. Assuming same structure as run_migration.js
const { rawPool } = require("../src/config/database");

async function runPerformanceMigration() {
  try {
    const sqlPath = path.join(
      __dirname,
      "../sql/migrations/06_performance_indexes.sql"
    );
    console.log(`📖 Reading migration file: ${sqlPath}`);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration file not found at ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("🔄 Connecting to database...");
    console.log("🚀 Executing performance optimization migration...");
    
    // Execute the SQL
    await rawPool.query(sql);

    console.log("✅ Performance indexes added successfully!");
    console.log("   - Added indexes on notifications (user_id)");
    console.log("   - Added indexes on temporary_access_log (user_id)");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runPerformanceMigration();
