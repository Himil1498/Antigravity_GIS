const { pool } = require("../src/config/database");

async function fixUserRegions() {
  const client = await pool.getConnection();
  try {
    console.log("🔗 Connected to database...");

    console.log("🔍 Checking for potential duplicates in user_regions...");

    // 1. Remove duplicates if any (keep latest assigned_at)
    // using CTID approach or simple delete with subquery
    const deleteDuplicatesQuery = `
      DELETE FROM user_regions a USING (
        SELECT MIN(ctid) as ctid, user_id, region_id
        FROM user_regions 
        GROUP BY user_id, region_id HAVING COUNT(*) > 1
      ) b
      WHERE a.user_id = b.user_id 
        AND a.region_id = b.region_id 
        AND a.ctid <> b.ctid;
    `;

    const deleteRes = await client.query(deleteDuplicatesQuery);
    if (deleteRes.rowCount > 0) {
      console.log(`🧹 Removed ${deleteRes.rowCount} duplicate entries.`);
    } else {
      console.log("✅ No duplicates found.");
    }

    // 2. Add Unique Constraint
    console.log("🛠️ Adding UNIQUE constraint on (user_id, region_id)...");

    await client.query(`
      ALTER TABLE user_regions 
      ADD CONSTRAINT unique_user_region_access UNIQUE (user_id, region_id);
    `);

    console.log(
      '✅ Constraint "unique_user_region_access" added successfully!',
    );
  } catch (err) {
    if (err.code === "42710") {
      // duplicate_object
      console.log("✅ Constraint already exists.");
    } else {
      console.error("❌ Error fixing database:", err);
    }
  } finally {
    client.release();
    process.exit();
  }
}

fixUserRegions();
