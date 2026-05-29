const { pool } = require('../src/config/database');

async function optimize() {
    const client = await pool.getConnection();
    try {
        console.log('Starting Database Optimization...');
        
        console.log('1. Analyzing network_features...');
        await client.query('VACUUM ANALYZE network_features');
        
        console.log('2. Clustering network_features on Geometry Index...');
        // Note: CLUSTER takes an exclusive lock. Might fail if app is actively writing.
        try {
            await client.query('CLUSTER network_features USING idx_network_features_geom');
            console.log('   Clustering complete.');
        } catch (e) {
            console.warn('   Clustering failed (likely locked or index missing):', e.message);
        }

        console.log('3. Analyze network_files...');
        await client.query('VACUUM ANALYZE network_files');
        
        console.log('Optimization Finished.');
    } catch (e) {
        console.error('Optimization Failed:', e);
    } finally {
        client.release(); // Ensure release
        process.exit(0);
    }
}

optimize();
