const { pool } = require('../src/config/database');

async function listTables() {
    try {
        const client = await pool.getConnection();
        const [rows] = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log("Tables:", rows.map(r => r.table_name));
        client.release();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listTables();
