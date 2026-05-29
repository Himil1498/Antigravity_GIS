const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../Frontend/.env') });

const FRONTEND_SRC = path.join(__dirname, '../Frontend/src');
const SERVICES_DIR = path.join(FRONTEND_SRC, 'services');

const LOG_SECTION = (title) => console.log(`\n\x1b[36m\x1b[1m=== ${title} ===\x1b[0m`);
const LOG_PASS = (msg) => console.log(`\x1b[32m✅ PASS: \x1b[0m ${msg}`);
const LOG_FAIL = (msg) => console.log(`\x1b[31m❌ FAIL: \x1b[0m ${msg}`);
const LOG_INFO = (msg) => console.log(`\x1b[34mℹ️ INFO: \x1b[0m ${msg}`);

const EXPECTED_SERVICES = [
    { module: 'Auth', file: 'services/api/authService.ts', keywords: ['login'] }, 
    { module: 'User Profile', file: 'services/api/authService.ts', keywords: ['getCurrentUserProfile'] },
    { module: 'User Management', file: 'services/user/userDataService.ts', keywords: ['getAllUsers', 'createUser', 'updateUser'] },
    { module: 'Infrastructure', file: 'services/dataHub', keywords: ['infrastructure'] },
    { module: 'GIS Tools', file: 'services/gisTools', keywords: ['measurement'] }, 
    { module: 'Analytics', file: 'services/analytics', keywords: ['dashboard', 'stats'] },
    { module: 'Admin', file: 'services/adminUserService.ts', keywords: ['getUserSessionStats'] },
    { module: 'Bookmarks', file: 'services/bookmark', keywords: ['create', 'delete'] },
    { module: 'Layers', file: 'services/layerPreloadingService.ts', keywords: ['preload'] }, // Layer creation is MISSING
    { module: 'Notifications', file: 'services/notification', keywords: ['get', 'read'] },
    { module: 'Regions', file: 'services/region/regionCoreService.ts', keywords: ['getAllRegions'] },
    { module: 'Search', file: 'services/search', keywords: ['global', 'history'] },
    { module: 'Reports', file: 'services/regionReports', keywords: ['activity', 'report'] },
    { module: 'Groups', file: 'services/group', keywords: ['create', 'get'] },
    { module: 'Audit', file: 'services/audit', keywords: ['get'] },
    // New Gap Analysis Additions
    { module: 'Advanced Auth', file: 'services/advancedAuth', keywords: ['verify'] },
    { module: 'Dev Tools', file: 'services/devTools', keywords: ['logs', 'system'] },
    { module: 'Fiber Ring', file: 'services/fiberRing', keywords: ['calc'] },
    { module: 'Metrics', file: 'services/metrics', keywords: ['record'] },
    { module: 'Password Reset', file: 'services/passwordReset', keywords: ['request', 'reset'] },
    { module: 'Region Analytics', file: 'services/regionAnalytics', keywords: ['analyze'] },
    { module: 'Region Hierarchy', file: 'services/regionHierarchy', keywords: ['get'] },
    { module: 'Region Request', file: 'services/regionRequest', keywords: ['submit'] },
    { module: 'Temporary Access', file: 'services/temporaryAccess', keywords: ['grant'] },
    { module: 'User Map Prefs', file: 'services/userMapPreferencesService.ts', keywords: ['save', 'load'] },
    { module: 'Websocket', file: 'services/websocket', keywords: ['connect', 'send'] }
];

const checkEnvironment = () => {
    LOG_SECTION('Environment Check');
    const envPath = path.join(__dirname, '../Frontend/.env');
    if (fs.existsSync(envPath)) {
        LOG_PASS('.env file exists');
        if (process.env.VITE_API_BASE_URL) {
            LOG_PASS(`VITE_API_BASE_URL is set: ${process.env.VITE_API_BASE_URL}`);
        } else {
            LOG_FAIL('VITE_API_BASE_URL is missing');
        }
    } else {
        LOG_FAIL('.env file missing');
    }
};

const findFile = (baseDir, partialPath) => {
    // Tries to find file or directory match
    const fullPath = path.join(baseDir, partialPath);
    if (fs.existsSync(fullPath)) return fullPath;
    
    // Try finding recursively or fuzzy if needed (simplified for now)
    // Check if it's a directory like 'services/bookmark' (which exists)
    // If partialPath doesn't have extension, check for .ts
    if (fs.existsSync(fullPath + '.ts')) return fullPath + '.ts';
    
    // Check children if it's a generic folder
    // For now assuming stricter mapping
    return null;
};

const scanForKeywords = (filePath, keywords) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const missing = [];
    keywords.forEach(kw => {
        const regex = new RegExp(kw, 'i');
        if (!regex.test(content)) missing.push(kw);
    });
    return missing;
};

const checkServices = () => {
    LOG_SECTION('Service Coverage Analysis');
    let allPass = true;
    
    // Helper to search recursively if given a directory
    const getFileContentAggregated = (dirPath) => {
        let content = '';
        if (fs.statSync(dirPath).isFile()) return fs.readFileSync(dirPath, 'utf-8');
        
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
        files.forEach(f => {
             content += fs.readFileSync(path.join(dirPath, f), 'utf-8');
        });
        return content;
    };

    EXPECTED_SERVICES.forEach(svc => {
        // We look for *any* file matching the pattern in services directory
        // Since structure is mixed (files vs folders), we search flexibly
        
        // 1. Check path existence relative to Frontend/src
        let foundPath = findFile(FRONTEND_SRC, svc.file);
        
        // 2. If not found direct, try fuzzy search in services dir
        if (!foundPath && svc.file.startsWith('services/')) {
             const name = path.basename(svc.file, '.ts');
             const candidates = fs.readdirSync(SERVICES_DIR);
             const match = candidates.find(c => c.toLowerCase().includes(name.toLowerCase()));
             if (match) foundPath = path.join(SERVICES_DIR, match);
        }

        if (foundPath) {
            // Check keywords
            try {
                const content = getFileContentAggregated(foundPath);
                const missing = [];
                svc.keywords.forEach(kw => {
                    if (!new RegExp(kw, 'i').test(content)) missing.push(kw);
                });

                if (missing.length === 0) {
                     LOG_PASS(`[${svc.module}] Found: ${path.basename(foundPath)}`);
                } else {
                     LOG_FAIL(`[${svc.module}] Found ${path.basename(foundPath)} but missing methods for: ${missing.join(', ')}`);
                     allPass = false;
                }
            } catch (e) {
                LOG_FAIL(`[${svc.module}] Error reading ${foundPath}: ${e.message}`);
                allPass = false;
            }
        } else {
            LOG_FAIL(`[${svc.module}] Service NOT Found! Expected around '${svc.file}'`);
            allPass = false;
        }
    });
    return allPass;
};

const checkBuild = () => {
    LOG_SECTION('Build Integrity');
    try {
        console.log('Running TypeScript compiler check (tsc --noEmit)... matches tsconfig.json');
        execSync('cd ../Frontend && npx tsc --noEmit', { stdio: 'pipe' });
        LOG_PASS('TypeScript check passed');
    } catch (e) {
        LOG_FAIL('TypeScript check failed. (See output below for details, typically types mismatch)');
        // console.log(e.stdout.toString().slice(0, 500) + '...'); // Only show first 500 chars 
    }
};

const run = async () => {
    console.log('🚀 Starting Frontend Health & Coverage Check...');
    
    checkEnvironment();
    checkServices();
    // checkBuild(); // Optional: can be slow, uncomment if verification requires build check

    console.log('\nDone.');
};

run();
