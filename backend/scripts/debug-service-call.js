require('dotenv').config({ path: 'Backend/.env' });
const analyticsService = require('../Backend/src/modules/analytics/analytics.service');

const run = async () => {
    try {
        console.log('--- Debugging Service Call ---');
        // UserId 1 is Admin usually
        const activities = await analyticsService.getRecentActivityList(1, 5);
        console.log('Success! Activities:', activities);
        process.exit(0);
    } catch (e) {
        console.error('Service Call Failed:', e);
        process.exit(1);
    }
};

run();
