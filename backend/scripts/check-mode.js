const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const mode = process.argv[2] || 'development';
const validModes = ['development', 'production'];

if (!validModes.includes(mode)) {
    console.error(`Invalid mode: ${mode}`);
    console.error(`Usage: node check-mode.js [development|production]`);
    process.exit(1);
}

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: .env file not found at ' + envPath);
    process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envPath));
// We use dotenv.parse to only check variables defined in the file, 
// not system environment variables, to ensure the file itself is correct.

const errors = [];

function check(key, expectedValue, isRegex = false) {
    const value = envConfig[key];
    if (!value) {
        errors.push(`Missing variable: ${key}`);
        return;
    }

    if (isRegex) {
        if (!expectedValue.test(value)) {
            errors.push(`Invalid ${key}: ${value} (Expected to match ${expectedValue})`);
        }
    } else {
        if (value !== expectedValue) {
            errors.push(`Invalid ${key}: ${value} (Expected: ${expectedValue})`);
        }
    }
}

function checkContains(key, subnet) {
     const value = envConfig[key];
     if (!value) {
        errors.push(`Missing variable: ${key}`);
        return;
    }
    if (!value.includes(subnet)) {
         errors.push(`Invalid ${key}: ${value} (Expected to include ${subnet})`);
    }
}

function checkNotLocalhost(key) {
    const value = envConfig[key];
     if (!value) {
        errors.push(`Missing variable: ${key}`);
        return;
    }
    if (value.includes('localhost') || value.includes('127.0.0.1')) {
        errors.push(`Invalid ${key}: ${value} (Should NOT be localhost in production)`);
    }
}


console.log(`Checking compatibility for mode: \x1b[36m${mode}\x1b[0m`);

if (mode === 'development') {
    check('NODE_ENV', 'development');
    if (envConfig['DB_HOST']) {
         if (envConfig['DB_HOST'] !== 'localhost' && envConfig['DB_HOST'] !== '127.0.0.1') {
             errors.push(`Invalid DB_HOST: ${envConfig['DB_HOST']} (Expected localhost for development)`);
         }
    }
    checkContains('FRONTEND_URL', 'localhost');
} else if (mode === 'production') {
    check('NODE_ENV', 'production');
    checkNotLocalhost('DB_HOST');
    checkNotLocalhost('FRONTEND_URL');
    checkNotLocalhost('API_URL');
    
    // Check for specific production subnet if applicable (e.g. 172.16)
    checkContains('DB_HOST', '172.16.');
    checkContains('API_URL', '172.16.');
}

// Check web.config
const webConfigPath = path.resolve(__dirname, '../web.config');
if (fs.existsSync(webConfigPath)) {
    const webConfigContent = fs.readFileSync(webConfigPath, 'utf8');
    if (mode === 'development') {
        if (webConfigContent.includes('node_env="production"') || webConfigContent.includes('value="production"')) {
            console.log('\x1b[33m%s\x1b[0m', '⚠ WARNING: web.config is configured for PRODUCTION.');
            console.log('\x1b[33m%s\x1b[0m', '  This is fine for "npm run dev", but will fail if deployed to IIS locally.');
        }
    }
}

if (errors.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Compatibility Check Failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
} else {
    console.log('\x1b[32m%s\x1b[0m', '✔ Compatibility Check Passed');
    process.exit(0);
}
