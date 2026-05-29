const axios = require('axios');

async function test() {
  try {
    console.log("Logging in...");
    const loginRes = await axios.post('http://localhost:82/api/auth/login', {
      email: 'admin@opticonnect.com',
      password: 'Admin@123'
    });
    
    const token = loginRes.data.token;
    console.log("Got token successfully");
    
    console.log("Fetching performance data...");
    const perfRes = await axios.get('http://localhost:82/api/analytics/performance?timeRange=24h&global=false', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log("Performance Data Response:");
    console.log(JSON.stringify(perfRes.data, null, 2));

  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

test();