const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function applyIndexes() {
    console.log('🚀 Starting Database Index Optimization...');
    
    const sqlPath = path.join(__dirname, '../sql/01_performance_indexes.sql');
    
    try {
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found at: ${sqlPath}`);
        }

        console.log(`📂 Reading SQL file: ${sqlPath}`);
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Connect to the database
        const client = await pool.getConnection(); // Use our wrapper's getConnection
        
        console.log('🔌 Connected to database. Applying indexes...');
        
        // Execute the entire script
        // Note: pg driver allows multiple statements in one query string
        await client.query(sqlContent);
        
        console.log('✅ All indices applied successfully!');
        
        client.release();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error applying indexes:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

applyIndexes();
