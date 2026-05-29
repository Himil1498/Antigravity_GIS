/**
 * Performance Load Test Script
 * Simulates concurrent traffic to critical endpoints
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });

const API_URL = process.env.API_URL || 'http://localhost:82';
const JWT_SECRET = process.env.JWT_SECRET;
const CONCURRENT_REQUESTS = 20;
const TOTAL_REQUESTS = 100;

// Improve console logging
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

async function runLoadTest() {
  log('🚀 Starting Performance Load Test');
  log(`Target: ${API_URL}`);
  log(`Concurrent Requests: ${CONCURRENT_REQUESTS}`);

  if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET not found in .env');
    process.exit(1);
  }

  // Generate test token
  const token = jwt.sign(
    { id: 1, role: 'admin', username: 'LoadTester' }, // Assuming user ID 1 exists/valid for test
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const client = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
    timeout: 30000 // 30s timeout
  });

  // Test 1: Health Check (Baseline)
  try {
    const start = Date.now();
    await client.get('/');
    log(`✅ Health Check: ${Date.now() - start}ms`);
  } catch (err) {
    console.error(`❌ Health Check Failed: ${err.message}`);
    process.exit(1);
  }

  // Test 2: DataHub All (Heavy Endpoint)
  log('\nload Testing /api/datahub/all...');
  
  const results = [];
  const batches = Math.ceil(TOTAL_REQUESTS / CONCURRENT_REQUESTS);

  for (let b = 0; b < batches; b++) {
    const promises = [];
    const batchSize = Math.min(CONCURRENT_REQUESTS, TOTAL_REQUESTS - (b * CONCURRENT_REQUESTS));
    
    log(`Processing Batch ${b + 1}/${batches} (${batchSize} requests)...`);

    for (let i = 0; i < batchSize; i++) {
      promises.push(
        (async () => {
          const start = Date.now();
          try {
            // Request with limit to test optimized path
            await client.get('/api/datahub/all?limit=50'); 
            const duration = Date.now() - start;
            return { success: true, duration };
          } catch (err) {
            return { success: false, duration: Date.now() - start, error: err.message };
          }
        })()
      );
    }

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    
    // Small delay between batches
    await new Promise(r => setTimeout(r, 200)); 
  }

  // Analyze Results
  const successes = results.filter(r => r.success);
  const failures = results.filter(r => !r.success);
  const durations = successes.map(r => r.duration);
  const avgTime = durations.reduce((a, b) => a + b, 0) / durations.length;
  const maxTime = Math.max(...durations);
  const minTime = Math.min(...durations);

  log('\n📊 Load Test Results');
  log('='.repeat(40));
  log(`Total Requests: ${TOTAL_REQUESTS}`);
  log(`Successful: ${successes.length} 🟢`);
  log(`Failed: ${failures.length} 🔴`);
  log(`Average Time: ${avgTime.toFixed(2)}ms`);
  log(`Min Time: ${minTime}ms`);
  log(`Max Time: ${maxTime}ms`);

  if (failures.length > 0) {
    log('\n❌ Sample Errors:');
    failures.slice(0, 3).forEach(f => console.error(`- ${f.error}`));
  }

  if (avgTime > 1000) {
    log('\n⚠️ Performance Warning: Average time > 1s');
  } else if (avgTime < 200) {
     log('\n🚀 Performance Excellent: Average time < 200ms');
  } else {
     log('\n✅ Performance Good: Average time < 1s');
  }
}

runLoadTest().catch(err => console.error(err));
