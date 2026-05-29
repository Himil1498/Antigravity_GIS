/**
 * Apply Performance Indexes Migration
 * 
 * This script applies the performance indexes from the migration file
 * and verifies they were created successfully.
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function applyIndexes() {
  console.log('🚀 Starting Performance Index Migration\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/add_performance_indexes.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements (filter out comments and empty lines)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') && 
        !stmt.startsWith('/*') &&
        stmt.toUpperCase().includes('CREATE INDEX')
      );
    
    console.log(`📝 Found ${statements.length} index creation statements\n`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Extract index name for logging
      const indexNameMatch = statement.match(/idx_\w+/);
      const indexName = indexNameMatch ? indexNameMatch[0] : `statement_${i + 1}`;
      
      try {
        await pool.query(statement);
        console.log(`✅ Created index: ${indexName}`);
        successCount++;
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`⏭️  Skipped (already exists): ${indexName}`);
          skipCount++;
        } else {
          console.error(`❌ Error creating ${indexName}:`, error.message);
          errorCount++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Created: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60) + '\n');
    
    // Verify indexes on critical tables
    console.log('🔍 Verifying indexes on critical tables...\n');
    
    const criticalTables = [
      'infrastructure_items',
      'region_boundaries',
      'user_regions',
      'audit_logs'
    ];
    
    for (const table of criticalTables) {
      try {
        const [indexes] = await pool.query(`SHOW INDEX FROM ${table}`);
        const indexNames = [...new Set(indexes.map(idx => idx.Key_name))];
        console.log(`📋 ${table}: ${indexNames.length} indexes`);
        indexNames.forEach(name => {
          if (name !== 'PRIMARY') {
            console.log(`   - ${name}`);
          }
        });
        console.log('');
      } catch (error) {
        console.error(`❌ Error checking ${table}:`, error.message);
      }
    }
    
    console.log('✅ Migration completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
applyIndexes().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
