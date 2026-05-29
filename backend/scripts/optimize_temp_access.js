const { pool } = require('../src/config/database');

async function addIndex() {
    const client = await pool.getConnection();
    try {
        console.log('Adding Index to temporary_access_log...');
        // Composite index for filtering active tokens expiring soon
        await client.query('CREATE INDEX IF NOT EXISTS idx_temp_access_status_end ON temporary_access_log(status, end_time)');
        console.log('Index Created Successfully.');
    } catch (e) {
        console.error('Failed to create index:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}

addIndex();
