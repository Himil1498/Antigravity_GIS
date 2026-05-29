const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../Backend/.env') });
const { pool } = require(path.join(__dirname, '../Backend/src/config/database'));

const run = async () => {
    try {
        console.log('Fixing layer_management schema...');
        
        // Check if columns exist to avoid error
        const [cols] = await pool.query('DESCRIBE layer_management');
        const fields = cols.map(c => c.Field);

        const alters = [];
        if (!fields.includes('type')) alters.push('ADD COLUMN type VARCHAR(50)');
        if (!fields.includes('layer_data')) alters.push('ADD COLUMN layer_data JSON');
        if (!fields.includes('is_visible')) alters.push('ADD COLUMN is_visible BOOLEAN DEFAULT TRUE');
        if (!fields.includes('is_public')) alters.push('ADD COLUMN is_public BOOLEAN DEFAULT FALSE');
        if (!fields.includes('description')) alters.push('ADD COLUMN description TEXT');
        if (!fields.includes('tags')) alters.push('ADD COLUMN tags JSON');
        if (!fields.includes('region_id')) alters.push('ADD COLUMN region_id INT');

        if (alters.length > 0) {
            const query = `ALTER TABLE layer_management ${alters.join(', ')}`;
            console.log('Running:', query);
            await pool.query(query);
            console.log('Schema fixed successfully.');
        } else {
            console.log('Schema already correct.');
        }

    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        process.exit();
    }
};

run();
