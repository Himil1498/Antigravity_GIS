require('dotenv').config({ path: 'Backend/.env' });
const { pool } = require('../Backend/src/config/database');

const run = async () => {
    try {
        console.log('--- Debugging Audit Schema ---');
        
        try {
            const [cols] = await pool.query('DESCRIBE audit_logs');
            console.log('Audit Logs Columns:', cols.map(c => c.Field).join(', '));
        } catch (e) {
            console.log('Describe Audit Logs Failed:', e.message);
        }

        try {
            // Try a raw query to see if it works
            const [rows] = await pool.query('SELECT * FROM audit_logs LIMIT 1');
            console.log('Sample Row:', rows[0] || 'No rows');
        } catch (e) {
            console.log('Select Failed:', e.message);
        }

        process.exit(0);

    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
};

run();
