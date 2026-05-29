const fs = require('fs');
const path = require('path');

// Load environment variables manually to avoid dependencies
const envPath = path.resolve(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: .env file not found at ' + envPath);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
        const parts = trimmedLine.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            envVars[key] = value;
        }
    }
});

const requiredVars = [
    // Server
    'PORT',
    
    // API
    'REACT_APP_API_URL',
    
    // Authentication
    'REACT_APP_USE_BACKEND',
    
    // Environment
    'NODE_ENV',
    'REACT_APP_ENV',
    
    // Google Maps
    'REACT_APP_GOOGLE_MAPS_API_KEY'
];

const missingVars = [];

requiredVars.forEach(varName => {
    if (!envVars[varName] && !process.env[varName]) {
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
