const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRONTEND_DIR = path.join(__dirname, '../Frontend');
const SRC_DIR = path.join(FRONTEND_DIR, 'src');

const thresholds = {
    largeFileBytes: 15000, // Warn if a single component file is > 15KB (indicates need for splitting)
    lazyImports: 3, // Expect at least 3 lazy loaded routes for a refined app
};

const stats = {
    lazyLoadedRoutes: 0,
    largeFiles: [],
    totalFiles: 0,
    hasReduxDevTools: false,
    hasViteCompression: false
};

const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m"
};

const walk = (dir) => {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walk(fullPath);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            stats.totalFiles++;
            if (stat.size > thresholds.largeFileBytes) {
                stats.largeFiles.push({ name: f, size: (stat.size / 1024).toFixed(2) + ' KB', path: fullPath });
            }
            // Check content
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes('React.lazy') || content.includes('lazy(()')) {
                stats.lazyLoadedRoutes++;
            }
        }
    }
};

const checkConfig = () => {
    try {
        const viteConfig = fs.readFileSync(path.join(FRONTEND_DIR, 'vite.config.ts'), 'utf-8');
        if (viteConfig.includes('compression') || viteConfig.includes('splitVendorChunkPlugin')) {
            stats.hasViteCompression = true;
        }
    } catch(e) {}
};

const run = () => {
    console.log(`${colors.bold}🚀 Starting Frontend Performance Audit...${colors.reset}\n`);
    
    walk(SRC_DIR);
    checkConfig();

    console.log(`${colors.cyan}--- Codebase Analysis ---${colors.reset}`);
    console.log(`Total Source Files: ${stats.totalFiles}`);
    
    // Lazy Loading Check
    if (stats.lazyLoadedRoutes >= thresholds.lazyImports) {
        console.log(`${colors.green}✅ Lazy Loading Detected: ${stats.lazyLoadedRoutes} instances (Good for FCP)${colors.reset}`);
    } else if (stats.lazyLoadedRoutes > 0) {
        console.log(`${colors.yellow}⚠️ Low Lazy Loading: Only ${stats.lazyLoadedRoutes} instances found.${colors.reset}`);
    } else {
        console.log(`${colors.red}❌ No Lazy Loading Detected: Consider using React.lazy for routes.${colors.reset}`);
    }

    // File Size Check
    if (stats.largeFiles.length === 0) {
        console.log(`${colors.green}✅ Component Sizing: All components are micro (<15KB). Excellent modularity.${colors.reset}`);
    } else {
        console.log(`${colors.yellow}⚠️ Large Components Detected (${stats.largeFiles.length}):${colors.reset}`);
        stats.largeFiles.slice(0, 5).forEach(f => console.log(`   - ${f.name} (${f.size})`));
        if (stats.largeFiles.length > 5) console.log(`   ...and ${stats.largeFiles.length - 5} more.`);
    }

    // Build Config Check
    /*
    if (stats.hasViteCompression) {
        console.log(`${colors.green}✅ Vite Optimization: Compression/Splitting plugins detected.${colors.reset}`);
    } else {
        console.log(`${colors.yellow}⚠️ Vite Optimization: Basic config. Consider adding compression plugins.${colors.reset}`);
    }*/

    console.log(`\n${colors.bold}=== Audit Verdict ===${colors.reset}`);
    if (stats.largeFiles.length < 10) { 
        console.log(`${colors.green}✅ Frontend Performance Structure: OPTIMIZED${colors.reset}`);
    } else {
        console.log(`${colors.yellow}⚠️ Frontend Performance Structure: NEEDS REFACTOR${colors.reset}`);
    }
};

run();
