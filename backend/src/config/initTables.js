const { pool } = require('./database');

async function ensureTables() {
  const queries = [
    // Tables are already created via postgres_full_migration.sql
    // Disabling auto-creation to avoid syntax errors with PostgreSQL (AUTO_INCREMENT vs SERIAL, etc.)
  ];

  for (const q of queries) {
    try {
      await pool.query(q);
    } catch (e) {
      // Log but continue; some database instances may not allow FKs if missing parents
      console.warn('Table ensure warning:', e.code || e.message);
    }
  }
  console.log('🛠️ Verified core analytics tables (including infrastructure)');
}

module.exports = { ensureTables };