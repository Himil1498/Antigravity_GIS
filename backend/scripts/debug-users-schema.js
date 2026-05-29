require('dotenv').config({ path: 'Backend/.env' });
const { pool } = require('../Backend/src/config/database');

const run = async () => {
    try {
        console.log('--- Debugging Users Schema ---');
        try {
            const [cols] = await pool.query('DESCRIBE users');
            console.log('Users Columns:', cols.map(c => c.Field).join(', '));
        } catch (e) {
            console.log('Describe Users Failed:', e.message);
        }
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
};

run();
