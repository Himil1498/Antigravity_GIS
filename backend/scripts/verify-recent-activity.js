require('dotenv').config({ path: 'Backend/.env' });
const axios = require('axios');

const ENV_API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 82}`;
const API_URL = ENV_API_URL.endsWith('/api') ? ENV_API_URL : `${ENV_API_URL}/api`;

const ADMIN_EMAIL = 'admin@opticonnect.com';
const ADMIN_PASSWORD = 'Admin@123';

const run = async () => {
    try {
        console.log('Logging in...');
        const login = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = login.data.token;
        console.log('Logged in.');

        console.log('\nTesting /analytics/recent-activity...');
        const res = await axios.get(`${API_URL}/analytics/recent-activity?limit=5`, { 
            headers: { Authorization: `Bearer ${token}` } 
        });

        console.log('Response Status:', res.status);
        console.log('Response Body Structure:', JSON.stringify(res.data, null, 2));

        if (res.data.success && res.data.data && Array.isArray(res.data.data.activities)) {
            console.log('✅ Structure Matches Frontend Expectation: response.data.data.activities exists.');
            console.log('Activity Count:', res.data.data.activities.length);
            if(res.data.data.activities.length > 0) {
                 console.log('Sample Activity:', res.data.data.activities[0]);
            }
        } else {
            console.log('❌ Structure Mismatch!');
        }

    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.log('Response Data:', e.response.data);
        }
    }
};

run();
