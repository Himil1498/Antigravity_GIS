const { rawPool: pool } = require("../src/config/database");

async function updatePermissions() {
  console.log("Starting permission migration...");

  try {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Update system_permissions catalog
      console.log("Updating system_permissions codes...");
      
      const updates = [
        { old: "gis.distance.use", new: "map:tools:distance" },
        { old: "gis.polygon.use", new: "map:tools:polygon" },
        { old: "gis.circle.use", new: "map:tools:circle" },
        { old: "gis.elevation.use", new: "map:tools:elevation" },    
        { old: "map:tools:sector_rf_fiber_ring", new: "map:tools:sector_rf" }, // Split
      ];

      for (const update of updates) {
        await client.query(
          "UPDATE system_permissions SET code = $1 WHERE code = $2",
          [update.new, update.old]
        );
      }
      
      // Add missing if split logic left a gap (e.g. Fiber Ring)
      // Check if map:tools:fiber_ring exists
      const res = await client.query("SELECT 1 FROM system_permissions WHERE code = 'map:tools:fiber_ring'");
      if (res.rowCount === 0) {
          console.log("Inserting map:tools:fiber_ring...");
          await client.query(
              "INSERT INTO system_permissions (category, code, name, description) VALUES ($1, $2, $3, $4)",
              ['map', 'map:tools:fiber_ring', 'Manage Fiber Rings']
          );
      }

      // 2. Update Users Permissions (JSONB)
      // We need to fetch all users, perform replacement in JS (safest), and update back.
      // Or use a clever SQL replace on the text representation.
      // In Postgres: UPDATE users SET permissions = REPLACE(permissions::text, 'old', 'new')::jsonb
      
      console.log("Updating users permissions...");

      // Same list of updates
      for (const update of updates) {
         await client.query(
          `UPDATE users SET permissions = REPLACE(permissions::text, $1, $2)::jsonb 
           WHERE permissions::text LIKE '%' || $1 || '%'`,
          [update.old, update.new]
        );
      }

      // Special case: Add fiber ring permission to anyone who had sector_rf_fiber_ring?
      // Actually, standardizing map:tools:sector_rf_fiber_ring -> map:tools:sector_rf covers the rename.
      // But if they had the combined permission, they should probably GET the split permissions.
      // The Rename above changes 'sector_rf_fiber_ring' -> 'sector_rf'.
      // So they lost 'fiber_ring' unless we add it.

      // Let's Find users who have map:tools:sector_rf (after rename) AND NOT map:tools:fiber_ring
      // And give them map:tools:fiber_ring? 
      // Assumption: The old permission meant access to BOTH. 
      // So yes, let's append fiber_ring to anyone who has sector_rf now (if they don't have it).
      
      await client.query(`
        UPDATE users 
        SET permissions = permissions || '["map:tools:fiber_ring"]'::jsonb
        WHERE permissions @> '["map:tools:sector_rf"]' 
        AND NOT (permissions @> '["map:tools:fiber_ring"]')
      `);
      
      console.log("Adding fiber_ring to users with sector_rf...");

      await client.query("COMMIT");
      console.log("Migration completed successfully!");

    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    // Force close pool
    // pool.end() might hang if connection logic is complex, but let's try
    process.exit(0);
  }
}

updatePermissions();
