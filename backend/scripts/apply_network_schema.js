const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function applySchema() {
    console.log('🚀 Applying Network Region Schema...');
    
    const sqlPath = path.join(__dirname, '../sql/02_network_region_schema.sql');
    
    try {
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found at: ${sqlPath}`);
        }

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Connect to the database
        const client = await pool.getConnection(); 
        
        console.log('🔌 Connected to database. Executing schema update...');
        
        await client.query(sqlContent);
        
        console.log('✅ Schema updated successfully!');
        
        client.release();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error applying schema:', error.message);
        process.exit(1);
    }
}

applySchema();
