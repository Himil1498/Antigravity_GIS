const { pool } = require('../src/config/database');

async function checkRegions() {
    try {
        const query = 'SELECT * FROM regions ORDER BY id ASC LIMIT 10';
        const client = await pool.getConnection();
        const [rows] = await client.query(query);
        console.log('Regions:', JSON.stringify(rows, null, 2));
        client.release();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkRegions();
