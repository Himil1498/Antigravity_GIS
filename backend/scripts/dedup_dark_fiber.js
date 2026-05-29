require('dotenv').config({ path: __dirname + '/../.env' });
const { rawPool } = require('../src/config/database');

async function deduplicate() {
    console.log("Starting deduplication of dark_fiber_routes...");
    const client = await rawPool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Find total routes before
        const countBefore = await client.query('SELECT count(*) FROM dark_fiber_routes');
        console.log(`Total routes before cleanup: ${countBefore.rows[0].count}`);
        
        // Delete duplicates, keeping the one with the lowest ID for each identical geometry
        const deleteQuery = `
            DELETE FROM dark_fiber_routes a
            USING dark_fiber_routes b
            WHERE ST_Equals(a.geom, b.geom) 
              AND a.id > b.id;
        `;
        
        const res = await client.query(deleteQuery);
        console.log(`Deleted ${res.rowCount} duplicate routes.`);
        
        const countAfter = await client.query('SELECT count(*) FROM dark_fiber_routes');
        console.log(`Total routes after cleanup: ${countAfter.rows[0].count}`);
        
        // Let's also do the same for nodes, just in case the nodes are also duplicated 26 times!
        const deleteNodesQuery = `
            DELETE FROM dark_fiber_nodes a
            USING dark_fiber_nodes b
            WHERE ST_Equals(a.geom, b.geom) 
              AND a.id > b.id;
        `;
        const resNodes = await client.query(deleteNodesQuery);
        console.log(`Deleted ${resNodes.rowCount} duplicate nodes.`);
        
        await client.query('COMMIT');
        console.log("Deduplication completed successfully!");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error during deduplication:", err);
    } finally {
        client.release();
        process.exit(0);
    }
}

deduplicate();
