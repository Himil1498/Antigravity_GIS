const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: .env file not found at ' + envPath);
    process.exit(1);
}

dotenv.config({ path: envPath });

const requiredVars = [
    // Database
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_PORT',
    
    // Environment
    'NODE_ENV',
    
    // Frontend
    'FRONTEND_URL',
    
    // API
    'API_URL',
    
    // JWT
    'JWT_SECRET',
    'JWT_EXPIRE',
    
    // Server
    'PORT',
    'HOST',
    
    // Email
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM'
];

const missingVars = [];

requiredVars.forEach(varName => {
    if (!process.env[varName]) {
        missingVars.push(varName);
    }
});

if (missingVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing required environment variables:');
    missingVars.forEach(varName => {
        console.error('\x1b[31m%s\x1b[0m', `  - ${varName}`);
    });
    console.log('');
    console.log('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
} else {
    console.log('\x1b[32m%s\x1b[0m', '✔ Environment check passed: All required variables are present.');
    process.exit(0);
}
