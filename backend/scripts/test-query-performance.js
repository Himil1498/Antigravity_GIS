/**
 * Test Query Performance Script
 * Tests the performance improvements from Phase 1 optimizations
 */

const { pool } = require('../src/config/database');

async function testQueryPerformance() {
  console.log('🧪 Testing Query Performance\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Infrastructure viewport query with indexes
    console.log('\n📍 Test 1: Infrastructure Viewport Query');
    console.log('-'.repeat(60));
    
    const start1 = Date.now();
    const [items1] = await pool.query(`
      SELECT id
      FROM infrastructure_items
      WHERE latitude BETWEEN 20 AND 30
        AND longitude BETWEEN 70 AND 80
      LIMIT 1000
    `);
    const time1 = Date.now() - start1;
    
    console.log(`✅ Query completed in ${time1}ms`);
    console.log(`📊 Returned ${items1.length} items`);
    console.log(`🎯 Target: <100ms (Good: <50ms, Excellent: <30ms)`);
    console.log(`📈 Status: ${time1 < 30 ? '🟢 Excellent' : time1 < 50 ? '🟡 Good' : time1 < 100 ? '🟠 Acceptable' : '🔴 Needs Improvement'}`);
    
    // Test 2: User regions JOIN query (optimized)
    console.log('\n📍 Test 2: User Regions JOIN Query');
    console.log('-'.repeat(60));
    
    const start2 = Date.now();
    const [users] = await pool.query(`
      SELECT u.id
      FROM users u
      LEFT JOIN user_regions ur ON u.id = ur.user_id
      LEFT JOIN regions r ON ur.region_id = r.id
      GROUP BY u.id
      LIMIT 50
    `);
    const time2 = Date.now() - start2;
    
    console.log(`✅ Query completed in ${time2}ms`);
    console.log(`📊 Returned ${users.length} users`);
    console.log(`🎯 Target: <50ms (Good: <30ms, Excellent: <20ms)`);
    console.log(`📈 Status: ${time2 < 20 ? '🟢 Excellent' : time2 < 30 ? '🟡 Good' : time2 < 50 ? '🟠 Acceptable' : '🔴 Needs Improvement'}`);
    
    // Test 3: Region query with indexes
    console.log('\n📍 Test 3: Region Query');
    console.log('-'.repeat(60));
    
    const start3 = Date.now();
    const [regions] = await pool.query(`
      SELECT id
      FROM regions
      WHERE is_active = true
      ORDER BY name
    `);
    const time3 = Date.now() - start3;
    
    console.log(`✅ Query completed in ${time3}ms`);
    console.log(`📊 Returned ${regions.length} regions`);
    console.log(`🎯 Target: <20ms (Good: <10ms, Excellent: <5ms)`);
    console.log(`📈 Status: ${time3 < 5 ? '🟢 Excellent' : time3 < 10 ? '🟡 Good' : time3 < 20 ? '🟠 Acceptable' : '🔴 Needs Improvement'}`);
    
    // Test 4: Audit logs with indexes
    console.log('\n📍 Test 4: Audit Logs Query');
    console.log('-'.repeat(60));
    
    const start4 = Date.now();
    const [logs] = await pool.query(`
      SELECT id
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY created_at DESC
      LIMIT 100
    `);
    const time4 = Date.now() - start4;
    
    console.log(`✅ Query completed in ${time4}ms`);
    console.log(`📊 Returned ${logs.length} logs`);
    console.log(`🎯 Target: <30ms (Good: <20ms, Excellent: <10ms)`);
    console.log(`📈 Status: ${time4 < 10 ? '🟢 Excellent' : time4 < 20 ? '🟡 Good' : time4 < 30 ? '🟠 Acceptable' : '🔴 Needs Improvement'}`);
    
    const passCount = [
       time1 < 100, 
       time2 < 50, 
       time3 < 20, 
       time4 < 30
    ].filter(Boolean).length;

    const results = {
      test1_infra: { time: time1, passed: time1 < 100 },
      test2_userRegions: { time: time2, passed: time2 < 50 },
      test3_regions: { time: time3, passed: time3 < 20 },
      test4_auditLogs: { time: time4, passed: time4 < 30 },
      totalTime: time1 + time2 + time3 + time4,
      avgTime: (time1 + time2 + time3 + time4) / 4,
      allPassed: passCount === 4
    };
    console.log('JSON_RESULTS:' + JSON.stringify(results));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

// Run tests
testQueryPerformance().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
