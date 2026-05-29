require('dotenv').config({ path: 'Backend/.env' });
const { pool } = require('../Backend/src/config/database');

const indexes = [
    // Infrastructure
    { table: 'infrastructure_items', name: 'idx_infra_region', cols: 'region_id' },
    { table: 'infrastructure_items', name: 'idx_infra_created_by', cols: 'created_by' },
    { table: 'infrastructure_items', name: 'idx_infra_type', cols: 'item_type' },
    { table: 'infrastructure_items', name: 'idx_infra_lat', cols: 'latitude' },
    { table: 'infrastructure_items', name: 'idx_infra_lng', cols: 'longitude' },
    { table: 'infrastructure_items', name: 'idx_infra_lat_lng', cols: 'latitude, longitude' },
    { table: 'infrastructure_items', name: 'idx_infra_status', cols: 'status' },

    // Distance
    { table: 'distance_measurements', name: 'idx_dist_region', cols: 'region_id' },
    { table: 'distance_measurements', name: 'idx_dist_created_by', cols: 'created_by' },

    // Polygon
    { table: 'drawings_polygon', name: 'idx_poly_region', cols: 'region_id' },
    { table: 'drawings_polygon', name: 'idx_poly_created_by', cols: 'created_by' },

    // Circle
    { table: 'drawings_circle', name: 'idx_circle_region', cols: 'region_id' },
    { table: 'drawings_circle', name: 'idx_circle_created_by', cols: 'created_by' },

    // Sector
    { table: 'rf_sectors', name: 'idx_sector_region', cols: 'region_id' },
    { table: 'rf_sectors', name: 'idx_sector_created_by', cols: 'created_by' },

    // Fiber
    { table: 'fiber_rings', name: 'idx_fiber_region', cols: 'region_id' },
    { table: 'fiber_rings', name: 'idx_fiber_created_by', cols: 'created_by' },
    
    // Audit
    { table: 'audit_logs', name: 'idx_audit_user', cols: 'user_id' },
    { table: 'audit_logs', name: 'idx_audit_action', cols: 'action' },
    { table: 'audit_logs', name: 'idx_audit_created', cols: 'created_at' },

    // Utils
    { table: 'users', name: 'idx_users_username', cols: 'username' },
    { table: 'users', name: 'idx_users_email', cols: 'email' }
];

const run = async () => {
    console.log('🚀 Starting Database Optimization...');
    let applied = 0;
    
    for (const idx of indexes) {
        try {
            console.log(`Analyzing ${idx.table} -> ${idx.name}...`);
            await pool.query(`CREATE INDEX ${idx.name} ON ${idx.table}(${idx.cols})`);
            console.log(`✅ Applied index: ${idx.name}`);
            applied++;
        } catch (e) {
            if (e.message.includes('Duplicate key') || e.code === 'ER_DUP_KEYNAME') {
                console.log(`ℹ️ Index ${idx.name} already exists.`);
            } else {
                console.warn(`⚠️ Failed to create ${idx.name}: ${e.message}`);
            }
        }
    }

    console.log(`\nOptimization Complete. Applied ${applied} new indexes.`);
    process.exit(0);
};

run();
