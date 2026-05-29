const { rawPool: pool } = require("../src/config/database");

const DEVELOPER_PERMISSIONS = [
    // GIS Tools - All (map:tools:*)
    "map:tools:distance", "map:tools:distance:save", "map:tools:distance:delete:any",
    "map:tools:polygon", "map:tools:polygon:save", "map:tools:polygon:delete:any",
    "map:tools:circle", "map:tools:circle:save", "map:tools:circle:delete:any",
    "map:tools:elevation", "map:tools:elevation:save", "map:tools:elevation:delete:any",
    "map:tools:sector_rf", "map:tools:fiber_ring",
    "gis.infrastructure.use", "gis.infrastructure.save", "gis.infrastructure.delete.any", "gis.infrastructure.import",

    // Data Management
    "data.view.all", "data.edit.all", "data.delete.all", "data.export",

    // User Management
    "users:view", "users:edit", "users:delete", "users:manage_permissions",
    "users:reset_password", "users:manage_security", "users:assign_regions", "users:assign_groups",

    // Admin/Settings
    "admin:view", "admin:bulk_assignment", "admin:temp_access", "admin:region_boundaries",
    "settings.view", "settings.boundary.edit", "settings.map.edit",

    // Search
    "search.use", "search.history.view", "bookmarks.create",

    // Navigation
    "map:view", "datahub:view", "network:view", "dashboard:view", "analytics:view", "groups:view"
];

async function assignDeveloperPermissions() {
    console.log("Starting developer permission assignment...");
    try {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            
            // Convert to JSON string
            const permsJson = JSON.stringify(DEVELOPER_PERMISSIONS);
            
            // Update all users with role 'developer' (case insensitive) AND 'Test' user if needed
            // Assuming checking by role is enough as user stated "Test user which have Developer Role"
            const res = await client.query(`
                UPDATE users 
                SET permissions = $1::jsonb
                WHERE LOWER(role) = 'developer'
            `, [permsJson]);
            
            console.log(`Updated permissions for ${res.rowCount} developer users.`);
            
            await client.query("COMMIT");
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
        process.exit(0);
    }
}

assignDeveloperPermissions();
