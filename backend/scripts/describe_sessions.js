const { pool } = require('../src/config/database');

async function describeTable() {
  try {
    const [rows] = await pool.query('DESCRIBE user_sessions');
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

describeTable();
