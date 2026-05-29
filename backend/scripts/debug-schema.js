const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../Backend/.env') });
const { pool } = require(path.join(__dirname, '../Backend/src/config/database'));

const run = async () => {
    try {
        console.log('--- Layer Management ---');
        const [layers] = await pool.query('SELECT * FROM layer_management LIMIT 1');
        if (layers[0]) {
            console.log(Object.keys(layers[0]).join(', '));
        } else {
            const [cols] = await pool.query('DESCRIBE layer_management');
            console.log(cols.map(c => c.Field).join(', '));
        }

        console.log('\n--- Infrastructure Items ---');
        const [infra] = await pool.query('SELECT * FROM infrastructure_items LIMIT 1');
        if (infra && infra[0]) {
            console.log(Object.keys(infra[0]).join(', '));
        } else {
             const [cols] = await pool.query('DESCRIBE infrastructure_items');
             console.log(cols.map(c => c.Field).join(', '));
        }

        console.log('\n--- Bookmarks ---');
        const [bk] = await pool.query('SELECT * FROM bookmarks LIMIT 1');
        if (bk && bk[0]) {
            console.log(Object.keys(bk[0]).join(', '));
        } else {
             const [cols] = await pool.query('DESCRIBE bookmarks');
             console.log(cols.map(c => c.Field).join(', '));
        }
        console.log('\n--- Search History ---');
        const [hist] = await pool.query('SELECT * FROM search_history LIMIT 1');
        if (hist && hist[0]) {
            console.log(Object.keys(hist[0]).join(', '));
        } else {
             const [cols] = await pool.query('DESCRIBE search_history');
             console.log(cols.map(c => c.Field).join(', '));
        }
    } catch (e) {
        console.error('Debug Schema Error:', e.message);
    } finally {
        process.exit();
    }
};

run();
