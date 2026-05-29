const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

const run = async () => {
    try {
        console.log('Reading SQL file...');
        const sqlPath = path.join(__dirname, '../sql/create_boundary_change_history.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Executing SQL...');
        await pool.query(sql);
        
        console.log('✅ Success! Table created.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating table:', error);
        process.exit(1);
    }
};

run();
