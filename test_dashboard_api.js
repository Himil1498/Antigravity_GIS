const axios = require('axios');

async function test() {
  try {
    // Login to get token
    console.log("Logging in...");
    const loginRes = await axios.post('http://localhost:82/api/auth/login', {
      email: 'himil.chauhan@optimaltele.net',
      password: 'Prompt2@2@' // Assuming this is the password or we can use another one
    });
    
    const token = loginRes.data.token;
    console.log("Got token:", token.substring(0, 15) + "...");
    
    // Fetch performance data
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
