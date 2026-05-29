const { pool } = require('../src/config/database');

async function checkSchema() {
    try {
        const client = await pool.getConnection();
        const res = await client.query(`
            SELECT table_name, column_name, data_type, udt_name
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name IN ('regions', 'region_boundaries', 'boundaries', 'admin_regions');
        `);
        console.log(JSON.stringify(res[0], null, 2));
        client.release();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSchema();
