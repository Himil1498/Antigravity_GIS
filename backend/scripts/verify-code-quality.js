const fs = require('fs');
const path = require('path');

const DIRS_TO_SCAN = [
    path.join(__dirname, '../Backend/src'),
    path.join(__dirname, '../Frontend/src')
];

const IGNORE_FILES = ['benchmark-performance.js', 'verify-api-health.js'];

const stats = {
    consoleLogs: 0,
    debuggers: 0,
    todos: 0,
    filesScanned: 0
};

const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    bold: "\x1b[1m"
};

const scanFile = (filePath) => {
    if (IGNORE_FILES.some(ignored => filePath.includes(ignored))) return;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let relativePath = filePath.replace(path.join(__dirname, '..'), '');

    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();

        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return; // Skip comments (mostly)

        if (trimmed.includes('console.log(')) {
            console.log(`${colors.yellow}⚠️ Console.log found: ${relativePath}:${lineNum}${colors.reset}`);
            stats.consoleLogs++;
        }
        if (trimmed.includes('debugger;')) {
            console.log(`${colors.red}❌ Debugger found: ${relativePath}:${lineNum}${colors.reset}`);
            stats.debuggers++;
        }
        if (trimmed.includes('TODO:') || trimmed.includes('FIXME:')) {
            console.log(`${colors.cyan}ℹ️ TODO found: ${relativePath}:${lineNum}${colors.reset}`);
            stats.todos++;
        }
    });
};

const walk = (dir) => {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walk(fullPath);
        } else if (f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.tsx')) {
            stats.filesScanned++;
            scanFile(fullPath);
        }
    }
};

const run = () => {
    console.log(`${colors.bold}🚀 Starting Final Code Quality Audit...${colors.reset}\n`);
    
    DIRS_TO_SCAN.forEach(dir => walk(dir));

    console.log(`\n${colors.bold}=== Audit Summary ===${colors.reset}`);
    console.log(`Files Scanned: ${stats.filesScanned}`);
    console.log(`Console Logs:  ${stats.consoleLogs} ${stats.consoleLogs > 0 ? '(Cleanup recommended for Prod)' : '✅'}`);
    console.log(`Todos/Fixmes:  ${stats.todos}`);
    console.log(`Debuggers:     ${stats.debuggers} ${stats.debuggers > 0 ? '❌ MUST FIX' : '✅'}`);

    if (stats.debuggers === 0) {
        console.log(`\n${colors.green}✅ Code Base is Clean & Production Ready!${colors.reset}`);
    } else {
        console.log(`\n${colors.red}❌ Code Base requires cleanup before deployment.${colors.reset}`);
    }
};

run();
